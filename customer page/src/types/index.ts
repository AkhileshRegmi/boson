export type Department =
  | "Product & Technology"
  | "Risk & Compliance"
  | "Brand & Marketing"
  | "Customer Support"
  | "Operations";

export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";

export interface Job {
  id: string;
  title: string;
  department: Department;
  employmentType: EmploymentType;
  experience: string;
  experienceLevel: "Entry" | "Mid" | "Senior" | "Lead";
  location: string;
  postedAt: string;
  summary: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  offers: string[];
  salaryRange: string;
}

