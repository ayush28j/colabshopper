docker compose down
cd colabshopper-backend
docker build -t colabshopper/backend .
cd ../colabshopper-frontend
docker build -t colabshopper/frontend .
cd ..
docker push colabshopper/backend
docker push colabshopper/frontend
aws --profile colabshopper ec2 --region ap-south-1 --no-cli-pager modify-security-group-rules --group-id sg-099c3d78c93d6a079 --security-group-rules SecurityGroupRuleId=sgr-0d74a944ef8351102,SecurityGroupRule="{CidrIpv4=$(curl -s https://checkip.amazonaws.com)/32,IpProtocol=tcp,FromPort=22,ToPort=22}"
aws --profile colabshopper ec2 --region ap-south-1 --no-cli-pager modify-security-group-rules --group-id sg-099c3d78c93d6a079 --security-group-rules SecurityGroupRuleId=sgr-07d8e06ae81c911bc,SecurityGroupRule="{CidrIpv4=$(curl -s https://checkip.amazonaws.com)/32,IpProtocol=tcp,FromPort=27017,ToPort=27017}"
ssh -t -i ~/colabshopper.pem ubuntu@colabshopper.com '~/redeploy.sh'