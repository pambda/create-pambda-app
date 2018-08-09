# create-pambda-app

Create [Pambda](https://github.com/pambda/pambda) apps

## Installation

```
npm i -g create-pambda-app
```

## Usage

This package provides the command `create-pambda-app`.

You can run as follows:

```
npm init pambda-app <project-directory>
```

The code using Pambda and the template of [AWS SAM](https://github.com/awslabs/serverless-application-model) are generated in the directory specified by `project-directory`.
This command also creates an S3 Bucket for deploying the application.

To deploy the application, run the `deploy` script as follows:

```
cd <project-directory>
npm run deploy
```

## License

MIT
