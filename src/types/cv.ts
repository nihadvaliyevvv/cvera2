export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  location?: string;
  gpa?: string;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface Language {
  id: string;
  language: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  languages?: Language[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface CV {
  id: string;
  title: string;
  data: CVData;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
