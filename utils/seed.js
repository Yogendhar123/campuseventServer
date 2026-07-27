import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Category from '../models/Category.js';
import Venue from '../models/Venue.js';
import Event from '../models/Event.js';

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Role.deleteMany(),
    Category.deleteMany(),
    Venue.deleteMany(),
    Event.deleteMany(),
  ]);

  console.log('Seeding roles...');
  await Role.insertMany([
    { name: 'admin', permissions: ['*'], description: 'Full system access' },
    { name: 'organizer', permissions: ['events:manage', 'attendance:manage'], description: 'Manages events' },
    { name: 'student', permissions: ['events:view', 'registrations:manage'], description: 'Registers for events' },
  ]);

  console.log('Seeding users...');
  const admin = await User.create({ name: 'Admin User', email: 'admin@campus.edu', password: 'Admin@123', role: 'admin' });
  const organizer = await User.create({ name: 'Priya Organizer', email: 'organizer@campus.edu', password: 'Organizer@123', role: 'organizer' });
  const student = await User.create({ name: 'Arjun Student', email: 'student@campus.edu', password: 'Student@123', role: 'student' });

  console.log('Seeding categories...');
  const categories = await Category.insertMany([
    { name: 'Technical', description: 'Coding and tech events' },
    { name: 'Cultural', description: 'Music, dance and drama' },
    { name: 'Sports', description: 'Sporting competitions' },
    { name: 'Seminar', description: 'Expert talks and seminars' },
    { name: 'Club Activity', description: 'Club run events' },
  ]);

  console.log('Seeding venues...');
  const venues = await Venue.insertMany([
    { name: 'Main Auditorium', location: 'Block A', capacity: 500 },
    { name: 'Seminar Hall 1', location: 'Block B', capacity: 150 },
    { name: 'Computer Lab 2', location: 'Block C', capacity: 60 },
    { name: 'Sports Ground', location: 'Campus Grounds', capacity: 1000 },
  ]);

  console.log('Seeding events...');
  await Event.insertMany([
    {
      title: 'Java Coding Contest',
      description: 'Competitive programming contest for students.',
      date: new Date('2026-08-15'),
      time: '10:00',
      category: categories[0]._id,
      venue: venues[2]._id,
      capacity: 60,
      status: 'Upcoming',
      organizer: organizer._id,
    },
    {
      title: 'AI & Machine Learning Seminar',
      description: 'Seminar by industry experts on AI trends.',
      date: new Date('2026-08-20'),
      time: '14:00',
      category: categories[3]._id,
      venue: venues[1]._id,
      capacity: 150,
      status: 'Upcoming',
      organizer: organizer._id,
    },
    {
      title: 'Annual Cultural Fest',
      description: 'Music, dance and drama performances.',
      date: new Date('2026-09-05'),
      time: '17:00',
      category: categories[1]._id,
      venue: venues[0]._id,
      capacity: 500,
      status: 'Upcoming',
      organizer: admin._id,
    },
  ]);

  console.log('✅ Seed complete');
  console.log('Login with: admin@campus.edu / Admin@123 | organizer@campus.edu / Organizer@123 | student@campus.edu / Student@123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
