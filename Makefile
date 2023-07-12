build:
	docker build -t tangsengdaodaoweb .
deploy:
	docker build -t tangsengdaodaoweb  .
	docker tag tangsengdaodaoweb registry.cn-shanghai.aliyuncs.com/wukongim/tangsengdaodaoweb:latest
	docker push registry.cn-shanghai.aliyuncs.com/wukongim/tangsengdaodaoweb:latest