import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

export const sendResetEmail = async(email: string, resetUrl: string) =>{
    await transporter.sendMail({
        from: `"GymGear" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your GymGear password",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #111827; margin-bottom: 8px;">Reset your password</h2>
                <p style="color: #6b7280; margin-bottom: 24px;">
                     We received a request to reset your GymGear password.
          Click the button below to create a new password.
          This link expires in <strong>1 hour</strong>.
                </p>
                <a href="${resetUrl}"
                    style="display: inline-block; background: #f97316; color: white; font-weight: 600;
                 padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-bottom: 24px;"
                >
                    Reset Password
                </a>
                 <p style="color: #9ca3af; font-size: 12px;">
          If you didn't request this, you can safely ignore this email.
          Your password won't change.
        </p>
               <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">GymGear — Your gym equipment store</p>
            </div>  
        `
    })
    
}