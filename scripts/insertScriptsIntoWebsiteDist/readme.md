run this script to move the style sheets into the react app. its hacky but for now its as good as its gonna get.

## build

```sh
go mod tidy
go build
```

## use

When you are working in the website directory, this script will automatically fire off as a final stage in the `build` script. Basically you don't need to do much in this directory.
