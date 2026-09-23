# Version 1.1
eval $(ssh-agent -s)
hostname=$(uname -a | awk '{print $2}')
remote=$(git remote -v)
if [[ $remote =~ "github" ]]; then
    target="github"
fi
if [[ $remote =~ "gitlab" ]]; then
    target="gitlab"
fi
home=$(dirname ~/.ssh)
guess="$home/.ssh/ids/$hostname-to-$target"
echo guess: $guess
if [[ -f $guess ]]; then    
    read -p "Use ssh key file name '$guess'? [y/n]" yn
    if [[ $yn -eq "y" ]]; then
        ssh-add $guess
    else
        read -p "ssh key file name: " KEY_FILE
        ssh-add ~/.ssh/ids/$KEY_FILE
    fi
else
    read -p "ssh key file name: " KEY_FILE
    ssh-add ~/.ssh/ids/$KEY_FILE
fi


