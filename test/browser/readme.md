# browser test suites (local)

> Hey, don't forget to run the local server @ http://localhost:8080

to run the test suites you need to build the typed code then use node to run the executable file. these steps are condensed to `pnpm test`

```shell
pnpm install

pnpm run test
```

so with these tests we're using a uuid as the unique username / email so I suppose there is a chance for collision
