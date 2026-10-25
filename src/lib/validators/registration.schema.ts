import { z } from "zod";

const name = z.string().trim().min(2, "Name is required").max(120);
const email = z.string().trim().email("Enter a valid email").max(254).toLowerCase();
const phone = z.string().trim().min(7, "Enter a valid phone number").max(20);
const sapId = z.string().trim().min(2, "Student ID is required").max(30);
const cnic = z.string().trim().regex(/^\d{5}-\d{7}-\d{1}$/, "Format must be 12345-1234567-1");
const department = z.string().trim().min(2, "Department is required").max(80);
const optionalText = z.string().trim().max(120).optional().or(z.literal(""));

const consent = (message: string) =>
  z.preprocess((v) => v === "on" || v === true, z.boolean().refine((b) => b, { message }));

export const registrationMemberSchema = z.object({
  name,
  email,
  phone,
  sapId,
  cnic,
  department,
});

export const registrationSchema = z.object({
  teamName: z.string().trim().min(2, "Team name is required").max(120),
  leaderName: name,
  leaderEmail: email,
  leaderWhatsapp: phone,
  leaderSapId: sapId,
  leaderCnic: cnic,
  leaderDepartment: department,
  leaderUniversityId: z.string().trim().optional().or(z.literal("")),
  leaderUniversityText: optionalText,
  leaderSociety: optionalText,
  referralCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
  members: z.array(registrationMemberSchema).max(50).default([]),
  consentTransactionalSms: consent("You must consent to transactional messages"),
  consentMarketingSms: consent("You must consent to marketing updates"),
  consentTerms: consent("You must accept the Terms and Privacy Policy"),
}).superRefine((data, ctx) => {
  if (!data.leaderUniversityId && !data.leaderUniversityText) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter your university or institution name",
      path: ["leaderUniversityText"],
    });
  }
});

export type RegistrationInput = z.infer<typeof registrationSchema>;