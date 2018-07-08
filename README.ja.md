# create-pambda-app

[Pambda](https://github.com/pambda/pambda) アプリケーションの作成。

## Installation

```
npm i -g create-pambda-app
```

## Usage

このパッケージは、コマンド `create-pambda-app` を提供する。

[npx](https://www.npmjs.com/package/npx) を使って、以下のように実行することができる。

```
npx create-pambda-app <project-directory>
```

`project-directory` で指定したディレクトリに、 Pambda を使ったコードと [AWS SAM](https://github.com/awslabs/serverless-application-model) のテンプレートが生成される。
また、このコマンドはアプリケーションをデプロイするための S3 Bucket も作成する。

アプリケーションをデプロイするためには、以下のように `deploy` スクリプトを実行する。

```
cd <project-directory>
npm run deploy
```

## License

MIT
