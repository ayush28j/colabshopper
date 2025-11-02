docker compose down
cd colabshopper-backend
docker build -t colabshopper/backend .
cd ../colabshopper-frontend
docker build -t colabshopper/frontend .
cd ..
docker push colabshopper/backend
docker push colabshopper/frontend
ssh -t -i ~/colabshopper.pem ubuntu@colabshopper.com '~/redeploy.sh'