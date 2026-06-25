import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
    const authError = await requireAdmin(request);
    if(authError) return authError;

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File
    
        if(!file) {
            return NextResponse.json({message: 'No file provided.'}, {status: 400});
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject) =>{
            cloudinary.uploader.upload_stream(
                {folder: 'gymgear'},
                (error, result) =>{
                    if(error){
                        reject(error)
                    }
                    else{
                        resolve(result)
                    }
                }
            ).end(buffer);
        })

        return NextResponse.json(
            {url: (result as any).secure_url},
            {status: 200}
        )
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {message: 'Upload failed.'},
            {status: 500}
        )
    }
}