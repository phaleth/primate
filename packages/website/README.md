# Primate website

This package contains the code for https://primate.run, which uses Primate
itself.

## Run locally

```sh
npm start
```

## Edit content

The website's static content is located at [root docs][docs].

[docs]: https://github.com/primate-run/primate/tree/master/docs

## Build and Run deployment using Docker locally

### Clean
```sh
docker stop primate
docker rmi primate:$(date '+%Y-%m-%d')
```

### Build
```sh
docker build -t primate:$(date '+%Y-%m-%d') -f packages/website/Dockerfile .
docker builder prune -f
```

### Run
```sh
docker run --rm -d -p 6161:6161 --name=primate primate:$(date '+%Y-%m-%d')
docker logs primate -f
```

### Verify
```sh
docker exec -it primate ls -lha /app/website
```
