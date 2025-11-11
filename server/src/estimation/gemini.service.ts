import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class GeminiService {
    private ai: GoogleGenAI;
    
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;    
        if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
        } else {
        console.error('GEMINI_API_KEY is missing.');
        }
    }
 
    async estimateEfficiency(params: {
        batterySizeKWh: number;
        efficiency: number;
        carModel?: string | null;
        tempC?: number | null;
        windMs?: number | null;
        cond?: string | null;
    }): Promise<number | null> {
        
        if (!this.ai) return null; 

        const prompt = `
            You are an EV efficiency estimator. 
            Return only ONE number with two decimal places, like 1.16. No words, no units, just the number.
            This number is a multiplier applied to the base efficiency (kWh/100km).
            - 1.00 means no change.
            - Values > 1.00 mean efficiency worsens ( energy consumption increases ).
            - Values < 1.00 mean efficiency improves ( energy consumption decreases ).
            
            Inputs:
            - Battery size (kWh): ${params.batterySizeKWh}
            - Base efficiency (kWh/100km): ${params.efficiency}
            - Car model: ${params.carModel ?? 'Unknown'}
            - Ambient temperature (°C): ${params.tempC ?? 'Unknown'}
            - Wind speed (m/s): ${params.windMs ?? 'Unknown'}
            - Weather condition: ${params.cond ?? 'Unknown'}

            Guidelines:
            - Cold (<5°C) typically worsens efficiency (negative).
            - Strong wind worsens (negative).
            - Rain/Snow usually worsens (negative).
            - Mild temperatures (~15°C) roughly neutral.

            No explanation. Only return the multiplier.
        `.trim();

        try {
            const response = await this.ai.models.generateContent({
                model:  "gemini-2.5-flash",
                contents: prompt,
            });

            const result = (response.text ?? '').trim();

            // Extract the numeric value from the response
            const numberPattern = /-?\d+(\.\d{1,2})?/;
            const match = result.match(numberPattern);
            const value = match ? Number(match[0]) : null;

            // Validate the value to be within reasonable bounds
            if (value === null || !isFinite(value)) return null;
            const minMultiplier = 0.85;
            const maxMultiplier = 1.50;  
            
            if (value < minMultiplier) return minMultiplier;
            if (value > maxMultiplier) return maxMultiplier;
            return value;

        } catch (error) {
            console.error('Gemini API error:', error?.message || error);
            return null;
        }
    }
}