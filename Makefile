bootstrap:
	yarn

# deploy-staging:
# 	curl -X POST -d {} https://api.netlify.com/build_hooks/63c8f0a6383e9c319dbf91e6

# deploy-staging-manual:
# 	npx netlify build --context staging && netlify deploy -m "$$(git show -s --format='%h %s')" -p -s "b4e57fd9-6e95-4121-a8ad-f2b07e3c0e60" || echo "Fail to deploy"

start:
	npx expo-doctor
	yarn start

dev:
	yarn dev

dev-clear:
	yarn dev --clear

android:
	expo run:android

prebuild:
	npx expo prebuild --clean

build:
	eas build --platform android --profile development

build-production:
	eas build --platform android --profile production

doctor:
	@echo "Running Expo Doctor (Note: Metro config check may show path errors on Windows, this is normal)"
	@npx expo-doctor || echo "Note: If metro config error appeared, run 'make doctor-ps' for detailed info"

lint:
	yarn lint

lint-fix:
	yarn lint:fix

update:
	eas update:configure
