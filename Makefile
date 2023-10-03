.PHONY: develop production
develop:
	make -C backend/ backend
	make -C frontend/ frontend
production:
	make -C backend/ backend-production
	make -C frontend/ frontend-production
