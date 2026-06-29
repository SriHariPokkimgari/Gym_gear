import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "@/lib/db";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest){
    try {
        const {message, history} = await request.json() as {
            message: string,
            history: {role: "user" | "model"; parts: {text: string}[]}[]
        }
        
        if(!message) {
            return NextResponse.json(
                {message: "Message is required"},
                {status: 400}
            )
        }

        const productsResult = await pool.query(
            `SELECT p.name, p.description, p.price, p.stock,
                c.name AS category
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock > 0`
        );

        const products = productsResult.rows;
        const productContext = products.map((p) => 
            `-${p.name} (${p.category}): ₹${p.price} — ${p.description}  — Stock: ${p.stock}`
        ).join('\n');

        const systemPrompt = `You are GymBot, a helpful assistant for GymGear — an online gym equipment store.

Your job is to help customers:
- Find the right gym equipment for their goals
- Answer questions about products and pricing
- Help with order and cart related questions
- Give basic gym and fitness advice

Available products right now:
${productContext}

Rules:
- Be friendly, concise and helpful
- Always recommend products from our store when relevant
- Format prices in Indian Rupees (₹)
- If asked about something unrelated to gym/fitness/our store, politely redirect
- Keep responses short — maximum 3-4 sentences
- Never make up products that aren't in our inventory`

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history || []
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({response}, {status: 200})
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            {message: "Something went wrong."},
            {status: 500}
        )
    }
}