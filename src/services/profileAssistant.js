import { env } from "../config/env.js";

const maxSkills = 6;

function asText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function asSkills(value) {
  const entries = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(entries.map((item) => asText(item, 40)).filter(Boolean))].slice(0, maxSkills);
}

function cleanDraft(value, fallback) {
  const draft = value && typeof value === "object" ? value : {};
  return {
    headline: asText(draft.headline, 120) || fallback.headline,
    bio: asText(draft.bio, 1200) || fallback.bio,
    skills: asSkills(draft.skills).length ? asSkills(draft.skills) : fallback.skills,
    serviceTitle: asText(draft.serviceTitle, 140) || fallback.serviceTitle,
    serviceDescription: asText(draft.serviceDescription, 900) || fallback.serviceDescription,
  };
}

function createGuidedDraft(input) {
  const skills = asSkills(input.skills);
  const specialty = asText(input.specialty, 80) || skills[0] || "digital work";
  const audience = asText(input.targetClient, 120) || "growing businesses";
  const experience = asText(input.experienceLevel, 40) || "independent";
  const summary = asText(input.summary, 500);
  const primarySkill = skills[0] || specialty;

  return {
    headline: `${specialty} specialist for ${audience}`.slice(0, 120),
    bio: [
      `I am an ${experience.toLowerCase()} ${specialty.toLowerCase()} specialist focused on clear, practical work for ${audience.toLowerCase()}.`,
      summary || `I help clients turn their ideas into thoughtful deliverables with a clear process and reliable communication.`,
      `My focus includes ${skills.length ? skills.join(", ") : primarySkill}.`,
    ].join(" ").slice(0, 1200),
    skills: skills.length ? skills : [specialty],
    serviceTitle: `I will help with ${primarySkill.toLowerCase()} for your project`.slice(0, 140),
    serviceDescription: `A focused ${primarySkill.toLowerCase()} service for ${audience.toLowerCase()}, with clear deliverables, friendly communication, and a thoughtful handoff.`.slice(0, 900),
  };
}

function extractResponseText(payload) {
  const content = payload?.output?.flatMap((item) => item?.content || []) || [];
  return content.find((item) => item?.type === "output_text")?.text || "";
}

export async function createProfileDraft(input) {
  const fallback = createGuidedDraft(input);
  if (!env.openai.apiKey) {
    return { ...fallback, source: "guided" };
  }

  const instructions = [
    "You write concise, credible freelancer marketplace profiles.",
    "Never invent credentials, years of experience, clients, results, or certifications.",
    "Return only valid JSON with headline, bio, skills, serviceTitle, and serviceDescription.",
    "Keep the tone warm, clear, specific, and professional.",
  ].join(" ");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openai.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.openai.model,
        instructions,
        input: JSON.stringify(input),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const output = extractResponseText(await response.json());
    const parsed = JSON.parse(output.replace(/^```json\s*|\s*```$/g, ""));
    return { ...cleanDraft(parsed, fallback), source: "ai" };
  } catch (error) {
    console.warn(`[profile assistant fallback] ${error.message}`);
    return { ...fallback, source: "guided" };
  }
}
