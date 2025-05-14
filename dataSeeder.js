import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import xlsx from 'xlsx';

import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

const MONGO_URI = 'mongodb+srv://raheem:NcHJtHpoqZXEPirf@cluster0.am7bibb.mongodb.net/socialApp?retryWrites=true&w=majority'; // Change if needed

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

const seedData = async () => {
    // Clear the existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    const users = [];
    const userCredentials = [];

    // Create 50 users
    for (let i = 0; i < 50; i++) {
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const profilePicture = faker.image.avatar();

        const user = new User({
            username,
            email,
            password,
            profilePicture
        });

        try {
            await user.save();
            console.log(`User ${i + 1}: ${username} created`);
            users.push(user);
            userCredentials.push({ username, email, password });
        } catch (err) {
            console.error(`Error creating user ${i + 1}:`, err);
        }
    }

    console.log(`${users.length} users created.`);

    const posts = [];

    // Create 200 posts after users are created
    for (let i = 0; i < 200; i++) {
        if (users.length > 0) {
            const author = faker.helpers.arrayElement(users);
            const post = new Post({
                user: author._id,
                caption: faker.lorem.sentence(),
                images: [faker.image.url()], // Changed from imageUrl() to url()
                likes: faker.helpers.shuffle(users).slice(0, faker.number.int({ min: 0, max: 10 })).map(u => u._id)
            });
            await post.save();
            posts.push(post);
        } else {
            console.error("No users available for creating posts.");
        }
    }

    console.log(`Created ${posts.length} posts.`);

    // Create 2–4 comments per post
    for (const post of posts) {
        const commentCount = faker.number.int({ min: 2, max: 4 }); // Updated from datatype to number
        for (let i = 0; i < commentCount; i++) {
            if (users.length > 0) {
                const user = faker.helpers.arrayElement(users);
                const comment = new Comment({
                    post: post._id,
                    user: user._id,
                    text: faker.lorem.sentence(),
                    likes: faker.helpers.shuffle(users).slice(0, faker.number.int({ min: 0, max: 5 })).map(u => u._id),
                    parentComment: null
                });
                await comment.save();
            } else {
                console.error("No users available for creating comments.");
            }
        }
    }

    console.log('✅ Seeded 50 users, 200 posts, and comments.');

    // Save user credentials to Excel
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(userCredentials);
    xlsx.utils.book_append_sheet(wb, ws, 'UserCredentials');
    const filePath = './userCredentials.xlsx';
    xlsx.writeFile(wb, filePath);
    console.log(`✅ User credentials saved to ${filePath}`);

    mongoose.disconnect();
};

seedData();