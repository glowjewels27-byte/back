import crypto from "crypto";
import NfcExperience from "../models/NfcExperience.js";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const buildSlug = (customerName) => {
  const base = slugify(customerName) || "glow-ring";
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
};

export const createNfcExperience = async (req, res) => {
  const { customerName, audioName, audioDataUrl } = req.body;

  if (!customerName?.trim()) return res.status(400).json({ message: "Customer name is required" });
  if (!audioName?.trim()) return res.status(400).json({ message: "Audio name is required" });
  if (!audioDataUrl?.startsWith("data:audio/")) {
    return res.status(400).json({ message: "Valid audio upload is required" });
  }

  const experience = await NfcExperience.create({
    customerName: customerName.trim(),
    audioName: audioName.trim(),
    audioDataUrl,
    slug: buildSlug(customerName)
  });

  res.status(201).json({
    ...experience.toObject(),
    publicUrl: `${process.env.CLIENT_URL || ""}/ring/${experience.slug}`
  });
};

export const getAdminNfcExperiences = async (req, res) => {
  const experiences = await NfcExperience.find().sort({ createdAt: -1 });
  res.json(
    experiences.map((item) => ({
      ...item.toObject(),
      publicUrl: `${process.env.CLIENT_URL || ""}/ring/${item.slug}`
    }))
  );
};

export const getPublicNfcExperience = async (req, res) => {
  const experience = await NfcExperience.findOne({ slug: req.params.slug, isActive: true }).select(
    "customerName slug audioDataUrl audioName createdAt"
  );
  if (!experience) return res.status(404).json({ message: "This ring page is unavailable" });
  res.json(experience);
};
