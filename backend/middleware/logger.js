import chalk from 'chalk';

const logger = (req, res, next) => {
    const timestamp = new Date().toUTCString();
    console.log(
        `${chalk.blue(req.url)} --------- ${chalk.yellow(
            req.method
        )} --------- ${chalk.green(res.statusCode)} -------- ${chalk.bold(
            timestamp
        )}`
    );
    next();
};

export default logger;
