"use client";

import { useState } from "react";

export type MemberValue = {
  name: string;
  email: string;
  phone: string;
  sapId: string;
  cnic: string;
  department: string;
};

const emptyMember = (): MemberValue => ({ name: "", email: "", phone: "", sapId: "", cnic: "", department: "" });

// Helper to auto-format CNIC (e.g. 12345-1234567-1)
const formatCnic = (val: string) => {
  let digits = val.replace(/\D/g, "").slice(0, 13); // Keep only digits, max 13
  if (digits.length > 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  } else if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
};

type Props = {
  maxMembers: number;
  errors?: Record<string, string>;
};

export function MemberRepeater({ maxMembers, errors = {} }: Props) {
  const [members, setMembers] = useState<MemberValue[]>([emptyMember()]);

  const add = () => {
    if (members.length < maxMembers) setMembers([...members, emptyMember()]);
  };
  const remove = (i: number) => {
    if (members.length > 1) setMembers(members.filter((_, idx) => idx !== i));
  };
  const update = (i: number, patch: Partial<MemberValue>) => {
    setMembers(members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  };

  return (
    <div>
      {members.map((m, i) => {
        const err = (field: string) => errors[`members.${i}.${field}`];
        return (
          <fieldset
            key={i}
            className="card"
            style={{ padding: 20, marginBottom: 16, position: "relative" }}
          >
            <legend className="eyebrow" style={{ color: "var(--color-signal)", fontSize: 12, padding: "0 6px" }}>
              Member {i + 1}
            </legend>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove member"
                style={{ position: "absolute", top: 10, right: 12, background: "transparent", border: 0, color: "var(--color-danger)", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 4 }}
              >
                ×
              </button>
            )}
            <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: 8 }}>
              <div>
                <label htmlFor={`m${i}_name`} className="label">Full name *</label>
                <input id={`m${i}_name`} name={`member.${i}.name`} className="input" value={m.name} onChange={(e) => update(i, { name: e.target.value })} required />
                {err("name") && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 4 }}>{err("name")}</p>}
              </div>
              <div>
                <label htmlFor={`m${i}_email`} className="label">Email *</label>
                <input id={`m${i}_email`} name={`member.${i}.email`} type="email" className="input" value={m.email} onChange={(e) => update(i, { email: e.target.value })} required />
                {err("email") && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 4 }}>{err("email")}</p>}
              </div>
              <div>
                <label htmlFor={`m${i}_phone`} className="label">Phone *</label>
                <input id={`m${i}_phone`} name={`member.${i}.phone`} type="tel" className="input" value={m.phone} onChange={(e) => update(i, { phone: e.target.value })} required />
                {err("phone") && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 4 }}>{err("phone")}</p>}
              </div>
              <div>
                <label htmlFor={`m${i}_sapId`} className="label">Student ID *</label>
                <input id={`m${i}_sapId`} name={`member.${i}.sapId`} className="input" value={m.sapId} onChange={(e) => update(i, { sapId: e.target.value })} required />
                {err("sapId") && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 4 }}>{err("sapId")}</p>}
              </div>
              
              <div>
                <label htmlFor={`m${i}_cnic`} className="label">CNIC *</label>
                <input 
                  id={`m${i}_cnic`} 
                  name={`member.${i}.cnic`} 
                  className="input" 
                  placeholder="12345-1234567-1" 
                  value={m.cnic} 
                  maxLength={15}
                  onChange={(e) => update(i, { cnic: formatCnic(e.target.value) })} 
                  required 
                />
                {err("cnic") && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 4 }}>{err("cnic")}</p>}
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor={`m${i}_department`} className="label">Department *</label>
                <input id={`m${i}_department`} name={`member.${i}.department`} className="input" value={m.department} onChange={(e) => update(i, { department: e.target.value })} required />
                {err("department") && <p style={{ fontSize: 12, color: "var(--color-danger)", marginTop: 4 }}>{err("department")}</p>}
              </div>
            </div>
          </fieldset>
        );
      })}

      <button type="button" onClick={add} disabled={members.length >= maxMembers} className="btn btn-outline-light btn-sm">
        + Add another member
      </button>
    </div>
  );
}