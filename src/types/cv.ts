export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  summary?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  profileImage?: string; // Premium feature - profile image URL
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
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

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  cause?: string;
}

export interface Publication {
  id: string;
  title: string;
  description?: string;
  url?: string;
  date?: string;
  publisher?: string;
  authors?: string[];
}

export interface HonorAward {
  id: string;
  title: string;
  description?: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface TestScore {
  id: string;
  testName: string;
  score: string;
  date?: string;
  description?: string;
}

export interface Recommendation {
  id: string;
  recommenderName: string;
  recommenderTitle?: string;
  recommenderCompany?: string;
  text: string;
  date?: string;
}

export interface Course {
  id: string;
  name: string;
  institution: string;
  description?: string;
  completionDate?: string;
  certificate?: boolean;
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
  volunteerExperience?: VolunteerExperience[];
  publications?: Publication[];
  honorsAwards?: HonorAward[];
  testScores?: TestScore[];
  recommendations?: Recommendation[];
  courses?: Course[];
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
