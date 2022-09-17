# Energy Auction Solana

## Setup

Install [Docker](https://docs.docker.com/engine/install).

Build the image and start a container:

```sh
docker build -t auction-dev-img .
docker run -d -v $PWD:/code --name auction-dev auction-dev-img
```

Install `package.json` dependencies and build the project:

```sh
docker exec -it auction-dev bash --login -c 'yarn install && anchor build'
```

## Demo

Open two interactive shell instances with:

```sh
docker exec -it auction-dev bash --login
```

Use them as follows.

1.  Start a local validator:

    ```sh
    solana-test-validator -r
    ```

2.  Run the demo:

    ```sh
    yarn run demo
    ```

## Cleanup

Stop and remove the container:

```sh
docker rm -f auction-dev
```
