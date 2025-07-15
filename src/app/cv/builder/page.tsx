"use client";
import { useRef, useState } from "react";

const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm

const initialCV = {
  fullName: "",
  email: "",
  phone: "",
  summary: "",
  experience: [{ company: "", role: "", start: "", end: "", description: "" }],
  education: [{ school: "", degree: "", start: "", end: "" }],
  skills: "",
};

export default function CVBuilderPage() {
  const [cv, setCV] = useState(initialCV);
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleInput = (field: string, value: any) => {
    setCV((prev) => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (idx: number, field: string, value: string) => {
    setCV((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === idx ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleEducationChange = (idx: number, field: string, value: string) => {
    setCV((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === idx ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    setCV((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: "", role: "", start: "", end: "", description: "" },
      ],
    }));
  };
  const addEducation = () => {
    setCV((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: "", degree: "", start: "", end: "" },
      ],
    }));
  };

  const handleExportPDF = async () => {
    setExporting(true);
    if (typeof window !== "undefined" && previewRef.current) {
      // @ts-expect-error HTML element event typing
      const html2pdf = (await import("html2pdf.js"))?.default || window.html2pdf;
      html2pdf()
        .from(previewRef.current)
        .set({
          margin: 0,
          filename: `${cv.fullName || "cv"}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save()
        .finally(() => setExporting(false));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-row bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      {/* Left Placeholder */}
      <div className="hidden lg:block flex-1"></div>
      {/* Center Content */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 py-10 px-2 md:px-8">
        {/* CV Form */}
        <form className="w-full md:w-1/2 bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-2">CV Builder</h2>
          <div>
            <label className="block font-medium">Full Name</label>
            <input className="input input-bordered w-full" value={cv.fullName} onChange={e => handleInput("fullName", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block font-medium">Email</label>
              <input className="input input-bordered w-full" value={cv.email} onChange={e => handleInput("email", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block font-medium">Phone</label>
              <input className="input input-bordered w-full" value={cv.phone} onChange={e => handleInput("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block font-medium">Professional Summary</label>
            <textarea className="textarea textarea-bordered w-full" value={cv.summary} onChange={e => handleInput("summary", e.target.value)} />
          </div>
          <div>
            <label className="block font-medium">Experience</label>
            {cv.experience.map((exp, idx) => (
              <div key={idx} className="mb-2 border-b pb-2">
                <input className="input input-bordered w-full mb-1" placeholder="Company" value={exp.company} onChange={e => handleExperienceChange(idx, "company", e.target.value)} />
                <input className="input input-bordered w-full mb-1" placeholder="Role" value={exp.role} onChange={e => handleExperienceChange(idx, "role", e.target.value)} />
                <div className="flex gap-2 mb-1">
                  <input className="input input-bordered flex-1" placeholder="Start" value={exp.start} onChange={e => handleExperienceChange(idx, "start", e.target.value)} />
                  <input className="input input-bordered flex-1" placeholder="End" value={exp.end} onChange={e => handleExperienceChange(idx, "end", e.target.value)} />
                </div>
                <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={exp.description} onChange={e => handleExperienceChange(idx, "description", e.target.value)} />
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline mt-1" onClick={addExperience}>Add Experience</button>
          </div>
          <div>
            <label className="block font-medium">Education</label>
            {cv.education.map((edu, idx) => (
              <div key={idx} className="mb-2 border-b pb-2">
                <input className="input input-bordered w-full mb-1" placeholder="School" value={edu.school} onChange={e => handleEducationChange(idx, "school", e.target.value)} />
                <input className="input input-bordered w-full mb-1" placeholder="Degree" value={edu.degree} onChange={e => handleEducationChange(idx, "degree", e.target.value)} />
                <div className="flex gap-2 mb-1">
                  <input className="input input-bordered flex-1" placeholder="Start" value={edu.start} onChange={e => handleEducationChange(idx, "start", e.target.value)} />
                  <input className="input input-bordered flex-1" placeholder="End" value={edu.end} onChange={e => handleEducationChange(idx, "end", e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline mt-1" onClick={addEducation}>Add Education</button>
          </div>
          <div>
            <label className="block font-medium">Skills</label>
            <input className="input input-bordered w-full" value={cv.skills} onChange={e => handleInput("skills", e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary w-full mt-4" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? "Exporting..." : "Export to PDF"}
          </button>
        </form>
        {/* Live Preview */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div
            ref={previewRef}
            className="bg-white shadow-xl border border-gray-200 rounded overflow-hidden"
            style={{
              width: `${A4_WIDTH}mm`,
              height: `${A4_HEIGHT}mm`,
              minWidth: 0,
              minHeight: 0,
              padding: "24mm 18mm",
              boxSizing: "border-box",
              fontFamily: "'Inter', Arial, sans-serif",
              color: "#222",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <h1 className="text-3xl font-bold mb-2">{cv.fullName || "Full Name"}</h1>
            <div className="flex gap-4 text-sm mb-2">
              <span>{cv.email || "email@example.com"}</span>
              <span>{cv.phone || "+123456789"}</span>
            </div>
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Professional Summary</h2>
              <p className="text-sm">{cv.summary || "A short summary about yourself."}</p>
            </div>
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Experience</h2>
              {cv.experience.map((exp, idx) => (
                <div key={idx} className="mb-1">
                  <div className="font-medium">{exp.role || "Role"} @ {exp.company || "Company"}</div>
                  <div className="text-xs text-gray-500">{exp.start || "Start"} - {exp.end || "End"}</div>
                  <div className="text-sm">{exp.description || "Description of your responsibilities and achievements."}</div>
                </div>
              ))}
            </div>
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Education</h2>
              {cv.education.map((edu, idx) => (
                <div key={idx} className="mb-1">
                  <div className="font-medium">{edu.degree || "Degree"} @ {edu.school || "School"}</div>
                  <div className="text-xs text-gray-500">{edu.start || "Start"} - {edu.end || "End"}</div>
                </div>
              ))}
            </div>
            <div className="mb-2">
              <h2 className="text-lg font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(cv.skills || "").split(",").map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{skill.trim() || "Skill"}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Placeholder */}
      <div className="hidden lg:block flex-1"></div>
    </div>
  );
}
