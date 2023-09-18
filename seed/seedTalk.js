const mongoose = require('mongoose');
const TalkPage = require('../model/talk');  
const Article = require('../model/article');  

mongoose.connect('mongodb://localhost:27017/wiki_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(error => {
  console.error('Error connecting to MongoDB:', error.message);
});

const seedTalkPages = async () => {
  try {
    // Fetch some articles from the database
    const articles = await Article.find().limit(5);

    if (articles.length === 0) {
      console.log('No articles found in the database. Please seed articles first.');
      return;
    }

    const talkPageData = articles.map(article => {
        return {
          articleId: article._id,
          discussions: [
            {
              topicId: new mongoose.Types.ObjectId().toString(),
              topic: 'General Discussion',
              comments: [
                {
                  username: 'Anonymous',
                  content: 'This is a comment about the article.',
                  date: new Date()
                }
              ]
            },
            {
              topicId: new mongoose.Types.ObjectId().toString(),
              topic: 'Content Accuracy',
              comments: [
                {
                  username: 'FactChecker',
                  content: 'I think there are some inaccuracies in the second paragraph.',
                  date: new Date()
                },
                {
                    username: 'ResearcherJohn',
                    content: 'I agree with FactChecker. I think the second paragraph needs to be rewritten.',
                    date: new Date()
                }
              ]
            },
            {
              topicId: new mongoose.Types.ObjectId().toString(),
              topic: 'Sources and References',
              comments: [
                {
                  username: 'ResearcherJane',
                  content: 'Could the author provide sources for the claims made in this article?',
                  date: new Date()
                },
                {
                    username: 'ResearcherJohn',
                    content: 'I agree with ResearcherJane. I think the article would be more credible if it had sources.',
                    date: new Date()
                }
              ]
            },
            {
              topicId: new mongoose.Types.ObjectId().toString(),
              topic: 'Improvements and Suggestions',
              comments: [
                {
                  username: 'WikiContributor',
                  content: 'I suggest adding a section about the historical background.',
                  date: new Date()
                },
                {
                    username: 'WikiContributor',
                    content: 'I also suggest adding a section about the author.',
                    date: new Date()
                }
              ]
            }
          ]
        };
    });

    await TalkPage.deleteMany({});
    await TalkPage.create(talkPageData);

    console.log('TalkPages seeded successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedTalkPages();