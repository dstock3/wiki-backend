const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../model/user');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connection established'))
  .catch(error => console.error('DB connection error:', error));

const sampleUser = {
  username: 'JohnDoe123',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!',
  bio: 'John is a technology enthusiast, avid reader, and passionate writer. He has contributed to several tech blogs and loves to explore new technological advancements.'
};
  
const sampleUser2 = {
  username: 'JaneSmith456',
  email: 'jane.smith@example.com',
  password: 'JaneSecurePass456!',
  bio: 'Jane is a digital artist and graphic designer. She enjoys creating digital art pieces and has a keen interest in 3D modeling. Jane also loves hiking and nature photography.'
};

const sampleUser3 = {
  username: 'TomAdventurer',
  email: 'tom.adventures@example.com',
  password: 'TomExpl0resWorld!',
  bio: "Tom is an avid traveler and blogger. He's visited over 50 countries and loves sharing his experiences and travel tips with his online community. When he's not traveling, Tom enjoys reading and playing the guitar."
};

const sampleUser4 = {
  username: 'AnnaTechie',
  email: 'anna.techworld@example.com',
  password: 'AnnaRocksTech21!',
  bio: 'Anna is a software engineer with over 8 years of experience. She loves coding in Python and has a passion for AI.'
};

const sampleUser5 = {
  username: 'MikeGreenThumb',
  email: 'mike.gardens@example.com',
  password: 'GreenPlantsRule!',
  bio: 'Mike is an urban gardener and botanist. He has a green thumb and loves sharing gardening tips.'
};

const sampleUser6 = {
  username: 'LiaBookworm',
  email: 'lia.reads@example.com',
  password: 'LoveToReadBooks!',
  bio: 'Lia is an author and avid reader. She has a large collection of books and often reviews them on her blog.'
};

const sampleUser7 = {
  username: 'TonyFitLife',
  email: 'tony.fitness@example.com',
  password: 'StayFitStayHappy!',
  bio: 'Tony is a fitness instructor and nutritionist. He loves helping people achieve their fitness goals.'
};

const sampleUser8 = {
  username: 'EllaArtistry',
  email: 'ella.arts@example.com',
  password: 'LoveForTheArts!',
  bio: 'Ella is a freelance artist and illustrator. She enjoys painting landscapes and doing digital art commissions.'
};

const users = [sampleUser, sampleUser2, sampleUser3, sampleUser4, sampleUser5, sampleUser6, sampleUser7, sampleUser8];

User.insertMany(users)
  .then(() => {
    console.log('Sample data seeded!');
    mongoose.connection.close();
  })
  .catch(error => console.error('Error seeding data:', error));