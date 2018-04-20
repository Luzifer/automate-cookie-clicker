default: lint

lint:
	docker run --rm -i -v $(CURDIR):$(CURDIR) -w $(CURDIR) luzifer/eslint *.js
