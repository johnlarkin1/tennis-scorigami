import { ExternalLink, Github, Linkedin, Mail, Twitter } from "lucide-react";
import Image from "next/image";

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  email: string;
  github: string;
  website?: string;
  twitter?: string;
  stackoverflow?: string;
  bio: string;
  // skills?: string[];
};

export const TeamMemberCard = ({
  name,
  role,
  image,
  linkedin,
  email,
  github,
  website,
  twitter,
  bio,
  // skills,
}: TeamMember) => (
  <div
    className="bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 
                  transform hover:-translate-y-1
                  focus-within:-translate-y-1 focus-within:shadow-xl
                  hover:ring-2 hover:ring-green-400 focus-within:ring-2 focus-within:ring-green-400
                  group h-full flex flex-col"
  >
    <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />
    </div>
    <h3 className="text-2xl font-bold text-center mb-2 text-white group-hover:text-green-400 group-focus-within:text-green-400 transition-colors">
      {name}
    </h3>
    <p className="text-green-400 text-center mb-4">{role}</p>
    <p className="text-gray-300 text-center mb-6 text-md flex-grow">{bio}</p>

    {/* Skills */}
    {/* {skills && skills.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
    )} */}

    {/* Social Links */}
    <div className="flex justify-center gap-3 mt-auto">
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
      >
        <Linkedin size={16} />
      </a>
      <a
        href={`mailto:${email}`}
        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
      >
        <Mail size={16} />
      </a>
      <a
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
      >
        <Github size={16} />
      </a>
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
        >
          <ExternalLink size={16} />
        </a>
      )}
      {twitter && (
        <a
          href={twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
        >
          <Twitter size={16} />
        </a>
      )}
    </div>
  </div>
);
