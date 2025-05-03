import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Notes from "./Notes";

export default function IndexPage() {
  return <Notes />;
}