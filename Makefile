deploy:
	# Build image on remote VPS Docker engine (create context once: docker context create tools-vps --docker "host=ssh://root@YOUR_VPS_IP")
	DOCKER_API_VERSION=1.41 docker --context tools-vps build --platform linux/amd64 -t ivanmachine/sveltekit.devside.no:latest -f Dockerfile .
	DOCKER_API_VERSION=1.41 docker --context tools-vps push ivanmachine/sveltekit.devside.no:latest
	git push -f && git push origin main:deploy -f
