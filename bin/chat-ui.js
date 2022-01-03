import { io } from 'socket.io-client';
import blessed from 'neo-blessed';
import ora from 'ora';
import chalk from 'chalk';
import axios from 'axios';


const baseUrl = "http://localhost:3000";
const spinner = ora();
const socket = io(baseUrl);

export const main = async (user, recipient, room) => {
    socket.emit('joinChat', {username:user.username, room});

    process.stdin.removeAllListeners('data');
    try {
        const screen = blessed.screen({
            smartCSR: true,
            title: 'Jeschat: A Terminal Chat App',
        });

        const messageList = blessed.list({
            align: 'left',
            mouse: false,
            keys: true,
            width: '100%',
            height: '90%',
            top: 0,
            left: 0,
            scrollbar: {
                ch: ' ',
                inverse: true,
            },
            items: ["<<<<<<< Welcome To Jeschat!!! >>>>>>",""],
        });

      
        // Append our box to the screen.
        const input = blessed.textarea({
            bottom: 0,
            height: '10%',
            inputOnFocus: true,
            keys: true,
            padding: {
                top: 1,
                left: 2,
            },
            style: {
                fg: '#787878',
                bg: '#454545',

                focus: {
                    fg: '#f6f6f6',
                    bg: '#353535',
                },
            },
        });

        input.key('enter', async function () {
            const message = this.getValue();
            displayMessage(messageList, message, screen);
            const payload = {
                message: chalk.blue.bold(message),
            };
            try {
                socket.emit("newMessage", payload);
                //TODO: Make A  post request to /send-message endpoint
            } catch (error) {
                console.log(error.message);
                process.exit(1);
            } finally {
                this.clearValue();
                screen.render();
            }
        });

        screen.key(['escape', 'q', 'C-c'], function () {
            return process.exit(0);
        });

        screen.append(messageList);
        screen.append(input);
        input.focus();

        screen.render();


        socket.on('newChat', (data) => {
            messageList.addItem(`${chalk.yellow(`<${data.username}>`)} ${data.message}`);
            messageList.addItem("");
            messageList.scrollTo(100);
            screen.render(); 
        });

    } catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
}

const displayMessage = (messageList, message, screen) => {
    messageList.addItem(chalk.yellow('<you> ') + message);
    messageList.addItem("");
    messageList.scrollTo(100);
    screen.render(); 
}