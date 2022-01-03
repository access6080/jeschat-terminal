#! /usr/bin/env node

import { Command } from 'commander';
import pkg from 'inquirer';
import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';

import { main } from './chat-ui.js';

const { prompt } = pkg;
const spinner = ora();
const program = new Command();
const baseUrl = "http://localhost:3000";

const menuSchema = [
    { 
        type: "list",
        name: "menu",
        message: "Select An Option",
        choices:["Login", "Sign Up"]
    }
]

const loginSchema = [
    {
        type: "input",
        name: "username",
        message: "Username:"
    },
    {
        type: "password",
        name: "password",
        message: "Password:"
    }
];

const signupSchema = [
    {
        type: "input",
        name: "username",
        message: "Username:"
    },
    {
        type: "password",
        name: "password",
        message: "Password:"
    },
    {
        type: "password",
        name: "confirmPassword",
        message: "Confirm Password:"
    }
];

const dashboardSchema = [
    {
        type: "list",
        name: "chatMenu",
        message: "Welcome to JesChat!",
        choices: ["Start a New Conversation", "Previous Conversations"]
    }
]

const searchSchema = [
    {
        type: "input",
        name: "user",
        message: "Recipient Username:",
    }
]



program
    .command("init")
    .alias("i")
    .description("Initialize The Chat Engine")
    .action(() => {
        prompt(menuSchema)
            .then((answers) => {
                if (answers.menu === "Login") {
                    prompt(loginSchema)
                        .then(async (answers) => {
                            try {
                                spinner.start('Authentication credentials...');
                                const loginData = await axios.post(`${baseUrl}/auth/login`, answers);
                                spinner.succeed(`Login successfully!`);
                            
                                if (loginData.data.success === true) {
                                    const user = loginData.data.response;
                                    
                                    console.clear();
                                    prompt(dashboardSchema)
                                        .then(async (answers) => {
                                            if (answers.chatMenu === "Start a New Conversation") {
                                                prompt(searchSchema)
                                                    .then(async (answers) => {
                                                        try {
                                                            const recipientData = await axios.post(`${baseUrl}/auth/`, { username: answers.user });
                                                            const recipient = recipientData.data.response;

                                                            try {
                                                                spinner.start("Creating Chat...")
                                                                const roomData = await axios.post(`${baseUrl}/chat/create-room`, { sender: user._id, recipient: recipient._id });

                                                                if (roomData.data.success === 2) {
                                                                    spinner.warn(chalk.yellow.bgBlueBright("Chat Already Exists..."))
                                                                    setTimeout(() => {
                                                                        spinner.start("Fetching Chat Data");
                                                                        spinner.succeed("Data Fetched Successfully");
                                                                    },1000)
                                                                } else {
                                                                    spinner.succeed("Chat Created Successfully");
                                                                }

                                                                const room = roomData.data.response;

                                                                // Client Side UI
                                                                spinner.start("Connecting to Chat Engine");
                                                                setTimeout(() => {
                                                                    spinner.succeed("Connecction Established")
                                                                    main(user, recipient, room);
                                                                }, 1500);
                                                                
                                                            } catch (error) {
                                                                spinner.fail(chalk.red('<rm> ' + error));
                                                                process.exit(1);
                                                            }
                                                        } catch (error) {
                                                            spinner.fail(chalk.red('<rt> ' + error.message));
                                                            process.exit(1);
                                                        }
                                                    })
                                            }
                                            else if (answers.chatMenu === "Previous Conversations") {
                                                try {
                                                    spinner.start("Retrieving Previous Conversations...");
                                                    const prevData = await axios.post(`${baseUrl}/chat/prev`, { id: user._id });
                                                    spinner.succeed("Previous Converations retrieved successfully")

                                                    if (prevData.data.success === 2) {
                                                        console.log(chalk.yellow.bold("You have no previous Conversations"));
                                                        process.exit(1)
                                                    }
                                                    const previousChatSchema = [
                                                        {
                                                            type: "list",
                                                            name: "chatPrev",
                                                            message: "Choose a Conversation",
                                                            choices: prevData.data.response
                                                        }
                                                    ];
                                        
                                                    prompt(previousChatSchema)
                                                        .then(async (answers) => {
                                                            try {
                                                                const recipientData = await axios.post(`${baseUrl}/auth/`, { username: answers.chatPrev });
                                                                const recipient = recipientData.data.response;
                                                                setTimeout(async () => {
                                                                    try {
                                                                        spinner.start("Fetching Chat Data");
                                                                        const roomData = await axios.post(`${baseUrl}/chat/create-room`, { sender: user._id, recipient: recipient._id });
                                                                        const room = roomData.data.response; 
                                                                        
                                                                        spinner.succeed("Data Fetched Successfully");
                                                                        

                                                                        // Client Side UI
                                                                        spinner.start("Connecting to Chat Engine");
                                                                        setTimeout(() => {
                                                                            spinner.succeed("Connecction Established")
                                                                            main(user, recipient, room);
                                                                        }, 1500);

                                                                    } catch (error) {
                                                                        console.log(error.message);
                                                                    }
                                                                }, 1000)                                                         
                                                            } catch (error) {
                                                                console.log(error.message);
                                                            }
                                                        })
                                                    
                                                } catch (error) {
                                                    spinner.fail(error.message);
                                                    process.exit(1);
                                                }
                                            }
                                        });
                                }

                            } catch (error) {
                                // console.log(error.message);
                                spinner.fail('Login Unsuccessful!');
                                process.exit(1);
                            }
                        })
                }
                else if (answers.menu === "Sign Up") {
                    prompt(signupSchema)
                        .then(async (answers) => {
                            try {
                                spinner.start('Authentication credentials...');
                                const signUpData = await axios.post(`${baseUrl}/auth/signup`, answers);
                                spinner.succeed(`Sign Up successfully!`);
                            
                                if (signUpData.data.success === true) {
                                    const user = signUpData.data.response;
                                    
                                    console.clear();
                                    prompt(dashboardSchema)
                                        .then(async (answers) => {
                                            if (answers.chatMenu === "Start a New Conversation") {
                                                prompt(searchSchema)
                                                    .then(async (answers) => {
                                                        try {
                                                            const recipientData = await axios.post(`${baseUrl}/auth/`, { username: answers.user });
                                                            const recipient = recipientData.data.response;

                                                            try {
                                                                spinner.start("Creating Chat...")
                                                                const roomData = await axios.post(`${baseUrl}/chat/create-room`, { sender: user._id, recipient: recipient._id });

                                                                if (roomData.data.success === 2) {
                                                                    spinner.warn(chalk.yellow.bgBlueBright("Chat Already Exists..."))
                                                                    setTimeout(() => {
                                                                        spinner.start("Fetching Chat Data");
                                                                        spinner.succeed("Data Fetched Successfully");
                                                                    },1000)
                                                                } else {
                                                                    spinner.succeed("Chat Created Successfully");
                                                                }

                                                                const room = roomData.data.response;

                                                                // Client Side UI
                                                                spinner.start("Connecting to Chat Engine");
                                                                setTimeout(() => {
                                                                    spinner.succeed("Connecction Established")
                                                                    main(user, recipient, room);
                                                                }, 1500);
                                                                
                                                            } catch (error) {
                                                                spinner.fail(chalk.red('<rm> ' + error));
                                                                process.exit(1);
                                                            }
                                                        } catch (error) {
                                                            spinner.fail(chalk.red('<rt> ' + error.message));
                                                            process.exit(1);
                                                        }
                                                    })
                                            }
                                            else if (answers.chatMenu === "Previous Conversations") {
                                                try {
                                                    spinner.start("Retrieving Previous Conversations...");
                                                    const prevData = await axios.post(`${baseUrl}/chat/prev`, { id: user._id });
                                                    spinner.succeed("Previous Converations retrieved successfully")

                                                    if (prevData.data.success === 2) {
                                                        console.log(chalk.yellow.bold(prevData.data.message));
                                                        process.exit(1)
                                                    }
                                                    const previousChatSchema = [
                                                        {
                                                            type: "list",
                                                            name: "chatPrev",
                                                            message: "Choose a Conversation",
                                                            choices: prevData.data.response
                                                        }
                                                    ];
                                        
                                                    prompt(previousChatSchema)
                                                        .then(async (answers) => {
                                                            try {
                                                                const recipientData = await axios.post(`${baseUrl}/auth/`, { username: answers.chatPrev });
                                                                const recipient = recipientData.data.response;
                                                                setTimeout(async () => {
                                                                    try {
                                                                        spinner.start("Fetching Chat Data");
                                                                        const roomData = await axios.post(`${baseUrl}/chat/create-room`, { sender: user._id, recipient: recipient._id })
                                                                        const room = roomData.data.response; 
                                                                        spinner.succeed("Data Fetched Successfully");

                                                                        // Client Side UI
                                                                        spinner.start("Connecting to Chat Engine");
                                                                        setTimeout(() => {
                                                                            spinner.succeed("Connecction Established")
                                                                            main(user, recipient, room);
                                                                        }, 1500);

                                                                    } catch (error) {
                                                                        console.log(error.message);
                                                                    }
                                                                }, 1000)                                                         
                                                            } catch (error) {
                                                                console.log(error.message);
                                                            }
                                                        })
                                                    
                                                } catch (error) {
                                                    spinner.fail(error.message);
                                                    process.exit(1);
                                                }
                                            }
                                        });
                                }

                            } catch (error) {
                                console.log(error.message);
                            }
                        })
                }
            })
    })

program.parse()