import { forwardRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, Award, Briefcase, GraduationCap, Languages, Star } from "lucide-react";

interface CVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImageUrl?: string;
  };
  sector: string;
  targetPosition: string;
  experiences: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
    description?: string;
  }>;
  skills: string[];
  languages: string[];
  certifications: string[];
}

interface CVPreviewProps {
  cvData: CVData;
  generatedContent?: string;
}

export const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>(
  ({ cvData, generatedContent }, ref) => {
    const { personalInfo, sector, targetPosition, experiences, education, skills, languages, certifications } = cvData;
    
    return (
      <div 
        ref={ref} 
        className="cv-preview bg-white text-black p-8 min-h-[297mm] w-[210mm] mx-auto shadow-2xl"
        style={{ 
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.4'
        }}
      >
        {/* Header avec photo et infos personnelles */}
        <div className="flex items-start gap-6 mb-8">
          <div className="flex-shrink-0">
            <Avatar className="w-24 h-24 border-4 border-gray-200">
              <AvatarImage src={personalInfo.profileImageUrl} />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {personalInfo.firstName[0]}{personalInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            <p className="text-xl text-blue-600 font-semibold mb-3">{targetPosition}</p>
            <p className="text-gray-600 mb-4">{sector}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{personalInfo.email}</span>
              </div>
              {personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="col-span-2 space-y-6">
            {/* Expérience professionnelle */}
            {experiences.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 border-b-2 border-blue-600 pb-1">
                    EXPÉRIENCE PROFESSIONNELLE
                  </h2>
                </div>
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <p className="text-blue-600 font-semibold">{exp.company}</p>
                      <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                      <p className="text-gray-700 text-sm">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Formation */}
            {education.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 border-b-2 border-blue-600 pb-1">
                    FORMATION
                  </h2>
                </div>
                <div className="space-y-3">
                  {education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-blue-600 font-semibold">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                      {edu.description && (
                        <p className="text-gray-700 text-sm mt-1">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compétences */}
            {skills.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900 border-b border-blue-600 pb-1">
                    COMPÉTENCES
                  </h2>
                </div>
                <div className="space-y-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-gray-100 rounded px-3 py-1 text-sm">
                      {skill}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Langues */}
            {languages.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-4 h-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900 border-b border-blue-600 pb-1">
                    LANGUES
                  </h2>
                </div>
                <div className="space-y-1">
                  {languages.map((lang, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      • {lang}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900 border-b border-blue-600 pb-1">
                    CERTIFICATIONS
                  </h2>
                </div>
                <div className="space-y-1">
                  {certifications.map((cert, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      • {cert}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Section contenu généré par IA si disponible */}
        {generatedContent && (
          <section className="mt-8 pt-6 border-t-2 border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              PROFIL PROFESSIONNEL
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {generatedContent}
            </div>
          </section>
        )}
      </div>
    );
  }
);

CVPreview.displayName = "CVPreview";