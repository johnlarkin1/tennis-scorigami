import React from 'react';
import Image from 'next/image';
import { SocialIcon } from 'react-social-icons';
import { Header } from '@/components/header';

type TeamMember = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  email: string;
  github: string;
  website?: string;
  twitter?: string;
  stackoverflow?: string;
};

type InfoCardProps = {
  title: string;
  description: string;
};

const InfoCard = ({ title, description }: InfoCardProps) => (
  <div className='bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'>
    <h2 className='text-2xl font-bold mb-4 text-green-400'>{title}</h2>
    <p className='text-gray-300'>{description}</p>
  </div>
);

const TeamMemberCard = ({
  name,
  role,
  image,
  linkedin,
  email,
  github,
  website,
  twitter,
  stackoverflow,
}: TeamMember) => (
  <div
    className='bg-gray-800 p-6 rounded-lg shadow-lg transition-all duration-300 
                  transform hover:-translate-y-1 hover:shadow-xl
                  focus-within:-translate-y-1 focus-within:shadow-xl
                  hover:ring-2 hover:ring-green-400 focus-within:ring-2 focus-within:ring-green-400
                  group'
  >
    <div className='relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden'>
      <Image src={image} alt={name} layout='fill' objectFit='cover' />
    </div>
    <h3 className='text-2xl font-bold text-center mb-2 text-white group-hover:text-green-400 group-focus-within:text-green-400 transition-colors'>
      {name}
    </h3>
    <p className='text-green-400 text-center mb-4'>{role}</p>
    <div className='flex justify-center space-x-4'>
      <SocialIcon url={linkedin} style={{ height: 30, width: 30 }} target='_blank' rel='noopener noreferrer' />
      <SocialIcon url={`mailto:${email}`} bgColor='black' network='email' style={{ height: 30, width: 30 }} />
      <SocialIcon
        url={github}
        bgColor='#5C6BC0'
        style={{ height: 30, width: 30 }}
        target='_blank'
        rel='noopener noreferrer'
      />
      {website && <SocialIcon url={website} network='smugmug' style={{ height: 30, width: 30 }} target='_blank' />}
      {twitter && <SocialIcon url={twitter} style={{ height: 30, width: 30 }} target='_blank' />}
      {stackoverflow && <SocialIcon url={stackoverflow} style={{ height: 30, width: 30 }} target='_blank' />}
    </div>
  </div>
);

const AboutPage: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'Henry Head',
      role: 'Product Engineer',
      image: '/henry.jpeg',
      linkedin: 'https://www.linkedin.com/in/jebhenryhead/',
      email: 'jeb.henryhead@gmail.com',
      github: 'https://github.com/henryhead',
      website: undefined,
      twitter: 'https://x.com/jebhenryhead',
      stackoverflow: undefined,
    },
    {
      name: 'John Larkin',
      role: 'Software Engineer',
      image: '/john.jpeg',
      linkedin: 'https://www.linkedin.com/in/johnlarkin/',
      email: 'john@tennisscorigami.com',
      github: 'https://github.com/johnlarkin1',
      website: 'https://johnlarkin1.github.io/',
      twitter: 'https://x.com/JLarks32',
      stackoverflow: 'https://stackoverflow.com/users/6347839/jlarks32',
    },
    {
      name: 'Sebastian Hoar',
      role: 'Data Scientist',
      image: '/seb.jpeg',
      linkedin: 'https://www.linkedin.com/in/sebastian-hoar-a71a5b112/',
      email: 'hoar.sebastian@gmail.com',
      github: 'https://github.com/johnlarkin1',
      website: undefined,
      twitter: undefined,
      stackoverflow: undefined,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header />

      <main className='container mx-auto px-4 py-8'>
        <div className='relative h-[500px] mb-12 rounded-lg overflow-hidden'>
          <Image
            src='/western-and-southern2.jpg'
            alt='Tennis Court'
            layout='fill'
            objectFit='cover'
            objectPosition='center'
            className='brightness-50'
          />
          <div className='absolute inset-0 flex items-center justify-center'>
            <h1 className='text-5xl font-bold text-white text-center drop-shadow-lg'>About Tennis Scorigami</h1>
          </div>
        </div>

        <p className='text-xl mb-12 text-center max-w-5xl mx-auto'>
          Tennis Scorigami is an innovative project that explores unique tennis match scores. Inspired by the concept of
          scorigami in other sports, this project visualizes the occurrence of rare tennis scorelines in major
          tournaments around the world.
        </p>

        <div className='grid gap-8 md:grid-cols-3 mb-16'>
          <InfoCard
            title='Origin'
            description='Born from the passion of three friends from Cincinnati who love sports, engineering, data science, and fun applications.'
          />
          <InfoCard
            title='Our Mission'
            description='To bring data-driven insights to tennis by exploring unique match scorelines, analyzing outcomes in major tournaments.'
          />
          <InfoCard
            title='How It Works'
            description='We use historical data and modern match tracking to identify rare scoring patterns, visualized through interactive tree diagrams.'
          />
        </div>

        <h2 className='text-4xl font-bold mb-8 text-center'>Meet Our Team</h2>
        <div className='grid gap-8 md:grid-cols-3'>
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.name} {...member} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
