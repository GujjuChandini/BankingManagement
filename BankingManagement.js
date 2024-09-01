import readline from 'readline';
import fs from 'fs';
import chalk from 'chalk';
import cliProgress from 'cli-progress';

// Create an interface for input and output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Account class
class Account {
    constructor(accountNumber, name, initialAmount) {
        this.accountNumber = accountNumber;
        this.name = name;
        this.amount = parseFloat(initialAmount);
    }

    checkBalance() {
        return `Current balance: ${chalk.green(`₹${this.amount}`)}`;
    }

    deposit(amt) {
        this.amount += parseFloat(amt);
        return `${chalk.blue(`₹${amt}`)} deposited. New balance: ${chalk.green(`₹${this.amount}`)}`;
    }

    withdraw(amt) {
        if (this.amount >= amt) {
            this.amount -= parseFloat(amt);
            return `${chalk.red(`₹${amt}`)} withdrawn. New balance: ${chalk.green(`₹${this.amount}`)}`;
        } else {
            return chalk.red("Insufficient balance");
        }
    }

    transcript() {
        return {
            "Account Number": this.accountNumber,
            "Name": this.name,
            "Balance": chalk.green(`₹${this.amount}`)
        };
    }
}

// Bank class
class Bank {
    constructor() {
        this.accounts = this.loadAccounts();
    }

    loadAccounts() {
        try {
            const data = fs.readFileSync('accounts.json', 'utf8');
            const accountsObj = JSON.parse(data);
            for (let key in accountsObj) {
                const account = accountsObj[key];
                accountsObj[key] = new Account(account.accountNumber, account.name, account.amount);
            }
            return accountsObj;
        } catch (error) {
            return {};  // Return empty object if file not found or error occurs
        }
    }

    saveAccounts() {
        fs.writeFileSync('accounts.json', JSON.stringify(this.accounts, null, 2));
    }

    createAccount(accountNumber, name, initialAmount) {
        if (this.accounts[accountNumber]) {
            return chalk.red("Account already exists.");
        } else {
            this.accounts[accountNumber] = new Account(accountNumber, name, initialAmount);
            this.saveAccounts();  // Save the updated accounts list
            return chalk.green(`Account created for ${name} with account number ${accountNumber}.`);
        }
    }

    authenticate(accountNumber) {
        return this.accounts[accountNumber] || null;
    }
}

// Bank instance
const bank = new Bank();

// Function to visualize a loading bar
function showProgressBar(description) {
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    console.log(description);
    bar.start(100, 0);

    let value = 0;
    const interval = setInterval(() => {
        value += 20;
        bar.update(value);
        if (value >= 100) {
            clearInterval(interval);
            bar.stop();
            console.log(chalk.cyan("Operation complete!\n"));
        }
    }, 100);
}

function askContinueOrQuit() {
    rl.question(chalk.yellow("Do you want to continue or quit? (Enter 'continue' or 'quit'): "), (response) => {
        if (response.toLowerCase() === 'continue') {
            startBankingSystem();
        } else {
            console.log(chalk.magenta.bold("Thank you for using the banking system. Goodbye!"));
            rl.close();
        }
    });
}

function startBankingSystem() {
    console.log(chalk.bold.bgBlue.white("\n--- Welcome to the Banking System ---\n"));
    rl.question(chalk.yellow("Do you want to create an account or do a transaction? (Enter 'create' or 'transaction'): "), (action) => {
        if (action.toLowerCase() === 'create') {
            rl.question(chalk.yellow("Enter Your Account Number: "), (accountNumber) => {
                rl.question(chalk.yellow("Enter Your Name: "), (name) => {
                    rl.question(chalk.yellow("Enter Initial Deposit Amount: "), (initialAmount) => {
                        showProgressBar("Creating account...");
                        setTimeout(() => {
                            console.log(bank.createAccount(accountNumber, name, initialAmount));
                            askContinueOrQuit();  // Ask to continue or quit
                        }, 600);
                    });
                });
            });
        } else if (action.toLowerCase() === 'transaction') {
            rl.question(chalk.yellow("Enter Your Account Number for Authentication: "), (authAccountNumber) => {
                let account = bank.authenticate(authAccountNumber);

                if (account) {
                    rl.question(chalk.yellow("Enter 1 (Deposit), 2 (Withdraw), 3 (Check Balance), 4 (Transcript): "), (work) => {
                        switch (parseInt(work)) {
                            case 1:
                                rl.question(chalk.yellow("Enter Amount to Deposit: "), (depositAmount) => {
                                    showProgressBar("Processing deposit...");
                                    setTimeout(() => {
                                        console.log(account.deposit(depositAmount));
                                        bank.saveAccounts();  // Save the transaction
                                        askContinueOrQuit();  // Ask to continue or quit
                                    }, 600);
                                });
                                break;
                            case 2:
                                rl.question(chalk.yellow("Enter Amount to Withdraw: "), (withdrawAmount) => {
                                    showProgressBar("Processing withdrawal...");
                                    setTimeout(() => {
                                        console.log(account.withdraw(withdrawAmount));
                                        bank.saveAccounts();  // Save the transaction
                                        askContinueOrQuit();  // Ask to continue or quit
                                    }, 600);
                                });
                                break;
                            case 3:
                                console.log(chalk.blue(account.checkBalance()));
                                askContinueOrQuit();  // Ask to continue or quit
                                break;
                            case 4:
                                console.log(account.transcript());
                                askContinueOrQuit();  // Ask to continue or quit
                                break;
                            default:
                                console.log(chalk.red("Invalid option selected."));
                                askContinueOrQuit();  // Ask to continue or quit
                        }
                    });
                } else {
                    console.log(chalk.red("Authentication failed. Account not found."));
                    askContinueOrQuit();  // Ask to continue or quit
                }
            });
        } else {
            console.log(chalk.red("Invalid action. Please enter 'create' or 'transaction'."));
            startBankingSystem();  // Ask for next action
        }
    });
}

startBankingSystem();
