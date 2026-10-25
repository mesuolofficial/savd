"use client";

import { useActionState } from "react";
import { submitContactMessage } from "@/lib/actions/message.actions";
import { FileUpload } from "./FileUpload";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, {} as any);

  return (
    <div className="card p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-ink mb-6">Send a Message</h2>
      
      {state.error && <div className="mb-4 text-sm font-bold text-danger bg-danger/10 p-3 rounded">{state.error}</div>}
      {state.msg && <div className="mb-4 text-sm font-bold text-success bg-success/10 p-3 rounded">{state.msg}</div>}

      <form action={formAction} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Your Name *</label><input name="name" className="input" required /></div>
          <div><label className="label">Your Email *</label><input name="email" type="email" className="input" required /></div>
        </div>
        <div><label className="label">Subject *</label><input name="subject" className="input" required /></div>
        <div><label className="label">Message *</label><textarea name="message" rows={5} className="input" required /></div>
        
        <div>
          <label className="label">Attach an Image (Optional)</label>
          <FileUpload name="image" accept="image/*" label="Click to attach an image" hint="JPG, PNG, GIF or WEBP · max 3 MB" />
        </div>
        
        <button type="submit" className="btn b1 w-full justify-center mt-2" disabled={pending}>
          {pending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}