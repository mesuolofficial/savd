"use client";

import { useEffect } from "react";
import { updateMessageStatusAction } from "@/lib/actions/message.actions";

export function AutoMarkRead({ id }: { id: string }) {
  useEffect(() => {
    // Runs only once when the component mounts
    updateMessageStatusAction(id, "READ");
  }, [id]);

  return null; // This component renders nothing
}