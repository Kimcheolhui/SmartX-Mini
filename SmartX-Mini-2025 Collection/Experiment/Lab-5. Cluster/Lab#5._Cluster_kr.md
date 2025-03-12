# Lab#5. Cluster Lab

## 0. Objective

쿠버네티스는 도커에 의해 컨테이너화(containerized)된 애플리케이션에 대한 배포, 스케일링, 그리고 관리를 자동화할 수 있습니다. 이를 컨테이너 오케스트레이터(container orchestrator)라고 합니다.

이번 Lab#5 Cluster에서, 우리는 3개의 NUC machine을 결합해 쿠버네티스 클러스터를 구축하고, 간단한 애플리케이션을 통해 Container Orchestration이란 무엇인지 알아보겠습니다.

총 3개의 NUC machine은 아래의 역할로써 쿠버네티스 클러스터를 구성하게 됩니다.

- 1개의 Master -> NUC1
- 2개의 Workers -> NUC2, NUC3

#### Master-Worker 구조란?

<img src='img/master-worker.png' alt='master-worker pattern' width="450">

Master-Worker 패턴은 하나의 **Master**가 전체 작업을 여러 개의 작은 단위로 나누어 **여러 Worker**에게 분배하고, 각 Worker가 독립적으로 작업을 수행한 후 결과를 Master에게 반환하는 소프트웨어 아키텍처 패턴입니다. 이 패턴은 병렬 처리를 통해 성능을 극대화하고, Worker를 동적으로 추가하거나 제거할 수 있어 확장성이 뛰어납니다. 또한, 특정 Worker가 작업에 실패하거나 노드(서버, 머신)가 다운되더라도 Master가 이를 감지하고 다른 Worker에게 작업을 재할당할 수 있어 애플리케이션의 안정적인 운영이 가능합니다. 이러한 특성 때문에 쿠버네티스의 클러스터 관리, Hadoop과 Spark의 분산 데이터 처리, Ray의 병렬 컴퓨팅, 멀티스레딩 기반의 애플리케이션 등에서 널리 사용됩니다.

## 1. Concept

### 1-1. Docker Containers

<img src='img/docker.png' alt='docker icon' width='225'>

<b>도커(Docker)</b>는 컨테이너 기술을 활용하여 애플리케이션을 보다 쉽게 개발, 배포, 실행할 수 있도록 도와주는 오픈소스 플랫폼입니다. 도커를 사용하면 애플리케이션과 해당 애플리케이션이 의존하는 라이브러리, 실행 환경을 하나의 단위(컨테이너)로 패키징하여 운영체제(OS) 환경에 독립적인 배포가 가능합니다.

#### 도커와 가상 머신(VM)의 차이

도커는 기존의 가상 머신(Virtual Machine)과 비교하여 더 가볍고 빠른 실행 환경을 제공하고, 효율적인 자원 사용을 가능케 합니다.

![Docker Containers Diagram](img/docker-diagram.png)

#### 사진 좌측

- 가상 머신(VM): 하이퍼바이저(Hypervisor)를 사용하여 여러 개의 운영체제(Guest OS)를 실행하며, 각 OS가 별도의 자원을 사용하기 때문에 무겁고 부팅 속도가 느립니다.
- 도커 컨테이너: 하나의 운영체제(OS) 커널을 공유하면서도 컨테이너별로 독립된 환경에서 실행됩니다. 컨테이너는 필요한 애플리케이션과 라이브러리만 포함하도록 경량화되었으며, 유연하고 빠른 실행과 배포가 가능합니다.

#### 사진 우측

도커는 클라이언트(Client)-서버(Server) 아키텍쳐를 기반으로 동작하며, 다음으로 구성되어 있습니다.

1. 개발자(docker client)가 도커 명령어 실행

   - `docker build`, `docker pull`, `docker run` 등의 명령어를 통해 도커 활용

2. Docker Daemon (서버) 처리

   - 컨테이너와 도커 이미지 등을 생성하고 관리
   - 개발자가 입력한 명령어를 실질적으로 실행하는 역할

3. Image Registry (이미지 저장소)

   - 애플리케이션의 컨테이너 이미지는 `Docker Hub`와 같은 원격 저장소에서 관리됩니다.
   - AWS ECR과 같은 클라우드형 이미지 Registry나 사설 Registry를 사용할 수도 있습니다.

### 1-2. 컨테이너 오케스트레이션(Container Orchestration)

컨테이너 기술이 널리 사용되면서 여러 개의 컨테이너를 자동으로 배포,관리, 스케일링(확장)하는 방법이 필요해졌습니다. 컨테이너 오케스트레이션은 이러한 문제를 해결하기 위해 등장했습니다.

#### 왜 Container Orchestration이 필요한가?

1. **컨테이너 개수 증가**
   - 단일 서버에서 몇 개의 Container를 실행하고 관리하는 것은 어렵지 않지만, 대규모 애플리케이션에서는 **수백~수천 개**의 컨테이너를 사용하기 때문에 관리가 쉽지 않음.
2. **자동화 및 관리 효율성**
   - 컨테이너의 배포, 네트워크 설정, 로드 밸런싱, 모니터링, 장애 발생 시 자동 복구 등의 기능이 필요함.
3. **고가용성 & 확장성 보장**
   - 특정 컨테이너가 다운되면 자동으로 재시작하거나, 트래픽 증가 시 컨테이너 개수를 자동으로 늘릴 수 있어야 함.

대표적으로 다음과 같은 기능을 제공합니다.

1. **자동화된 배포 및 업데이트**

   - 컨테이너를 자동으로 배포하고, 새로운 버전이 나오면 점진적으로 업데이트 진행 (Rolling Update)

2. **로드 밸런싱 & 서비스 디스커버리**

   - 트래픽을 여러 컨테이너로 분산하여 부하를 최소화하고, 컨테이너 간 통신을 자동으로 설정

3. **자동 복구(Self-healing)**

   - 장애가 발생한 컨테이너를 자동으로 감지하고, 새로운 컨테이너로 대체하여 서비스 중단 방지

4. **클러스터 리소스 최적화**

   - 컨테이너가 클러스터의 CPU, 메모리 등을 효율적으로 활용할 수 있도록 스케줄링

<img src='img/container-orch.png' alt='container orchestration tool' width="900">

위 사진은 대표적인 컨테이터 오케스트레이션 도구입니다. 현재는 <b>Kubernetes(K8s)</b>가 가장 널리 사용되고 있습니다. (맨 앞(K)과 뒤(s), 그리고 나머지 알파벳의 개수 '8'을 사용하여 K8s라고도 부릅니다.)

### 1-3. 쿠버네티스(Kubernetes)

<img src='img/k8s-arch.png' alt='k8s arch' width='900'>

[**Kubernetes**](https://kubernetes.io/)는 컨테이너화된 애플리케이션의 배포, 스케일링, 관리를 자동화하는 **오픈소스 오케스트레이션 시스템**입니다.

#### 1-3-1. **Kubernetes 주요 기능**

- **수평 확장(Horizontal Scaling)**: 간단한 명령어, UI 또는 CPU 샤용량을 기반으로 한 자동화(Auto-scaling)의 방식으로 애플리케이션의 규모를 확장(Scaling)할 수 있습니다.
- **자가 복구(Self-healing)**: 문제가 생긴 컨테이너를 재시작하거나, 문제가 생긴 노드(서버, 머신)에서 실행되고 있는 컨테이너들을 다른 노드의 컨테이너로 교체 혹은 재할당할 수 있으며, 사전 정의된 Health check에 응답하지 않는 컨테이너를 Kill할 수 있습니다. 문제가 해결되기 전까지는 문제가 생긴 노드(혹은 컨테이너)는 Clients에게 노출되지 않습니다.
- **서비스 검색 및 로드 밸런싱(Service Discovery & Load Balancing)**: 각 컨테이너에 고유한 IP를 부여하고, 클러스터 DNS 기반 서비스 검색을 할 수 있는 Service Discovery 기능을 제공합니다. 또한 Load Balancing을 사용해 여러 컨테이너에 트래픽을 분산할 수 있습니다.
- **스토리지 오케스트레이션(Storage Orchestration)**: 로컬 스토리지, 퍼블릭 클라우드 스토리지(NFS, Ceph, AWS EBS, GCP Persistent Disk 등) 등의 다양한 스토리지를 손쉽게 컨테이너에 마운트(Mount)하여 사용할 수 있습니다.

쿠버네티스는 현재 <b>클라우드 환경(AWS, GCP, Azure) 및 온프레미스(자체 서버)</b>에서 가장 널리 사용되는 컨테이너 오케스트레이션 도구입니다.

## 2. Lab Preparation

![Lab Preparation](img/7.png)

#### 2-1-2. From All NUCs

**(추가) 각 노드에서 openssh-server 설치하기**

sudo hostname <name>은 해당 명령어를 입력하는 machine의 hostname을 임시로 <name>으로 지정한다. 다만 해당 machine을 reboot할 경우, 기존 hostname으로 돌아가게 된다. 이번 Lab에서는 쿠버네티스 클러스터 구성 편의를 위해, 각 NUC에 임시 hostname을 설정하고자 한다.

```shell
# From NUC 1 :
sudo hostname nuc01
# From NUC 2 :
sudo hostname nuc02
# From NUC 3 :
sudo hostname nuc03
```

From All NUCs: Change hostname in /etc/hostname

**(좀 더 명확한 설명 추가)**

```shell
sudo rm /etc/hostname
# ex) echo nuc01 | sudo tee /etc/hostname
# if this is being executed on NUC 1
echo {NUC Hostname: One of nuc01, nuc02, nuc03} | sudo tee /etc/hostname
```

**Change `{NUC Hostname: One of nuc01, nuc02, nuc03}` to selected hostname above (01~03)**

From All NUCs: Append the following context into /etc/hosts

```shell
sudo vi /etc/hosts
```

```text
 <IP Address of NUC 1>  nuc01
 <IP Address of NUC 2>  nuc02
 <IP Address of NUC 3>  nuc03
```

#### 2-1-2. Check Connectivity

```shell
# From NUC 1
ping nuc02
ping nuc03

# From NUC 2
ping nuc01
ping nuc03

# From NUC 3
ping nuc01
ping nuc02
```

#### 2-1-3. From NUC1

**(수정) username은 gist고, hostname은 nuc01임**

**(추가) 새로운 터미널 여는 단축키 설명**

**(추가) Nuc01에서만 실행**
**(추가) nuc01에서 3개의 터미널을 열고, 각각 nuc01, nuc02, nuc03을 작업할거임.**

예시)  
<img width="116" alt="스크린샷 2022-05-24 오후 1 12 53" src="https://user-images.githubusercontent.com/65757344/169947428-3d028493-cf5e-4463-a9ea-d04f3bd56b99.png">  
**username은 netcs**이고  
hostname은 nuc01입니다!!!

**username is netcs**  
and hostname is nuc01!!!

**(추가) 현재 username은 gist로 통일되어 있습니다. 위 사진 지우기**

**(추가) 화면 세팅 어떻게 하는 걸 추천하는 지 추가하기**

```shell
# In new terminal
ssh <nuc2 username>@nuc02

# In another new terminal
ssh <nuc3 username>@nuc03
```

#### 2-1-4. Setting containerd

```bash
# For All NUCs
sudo apt-get update
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

#### 2-1-5. Reboot All NUC

```shell
# From All NUCs
sudo reboot
```

# 지금부터 NUC1 학생 자리에서 모든 작업을 시작합니다. NUC2, NUC3 학생은 NUC1자리로 가서 작업을 시작합니다.

# From now on, every thing goes with NUC1 student's seat. Students in NUC2, NUC3 should start work at NUC1 student's seat.

### 2-2. Preparations for Clustering

```shell
# From All NUCs
docker version
```

# From NUC1

```shell
ssh <NUC2 username>@nuc02
ssh <NUC3 username>@nuc03
```

### 2-3. Kubernets Installation(For All NUCs)

![Kubernets Installation](img/8.png)

- NUC 1 : Master
- NUC 2 : Worker 1
- NUC 3 : Worker 2

#### 2-3-1. Swapoff

**(추가) 스왑 메모리가 뭔지?**
**(추가) 스왑 메모리를 왜 꺼야하는지?**

```shell
# From All NUCs
sudo swapoff -a
```

#### 2-3-2. Install Kubernetes

**(경고) 무작정 다 때려넣지 말고, 실행이 잘 되는지 확인할 것**

```shell
# From All NUCs
sudo apt-get update && sudo apt-get install -y apt-transport-https curl ipvsadm wget

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update

sudo apt install -y kubeadm=1.28.1-1.1 kubelet=1.28.1-1.1 kubectl=1.28.1-1.1
```

### 2-4. Kubernetes Configuration

#### 2-4-1. Kubernetes Master Setting(For NUC1)

지금부터 sudo su 로 root에서 실행합니다

**(수정) sudo su가 뭔지 설명해야함. 아니면 아예 sudo su에서 작업을 하지 말거나.**

```shell
# From NUC1
kubeadm init --pod-network-cidr=10.244.0.0/16
```

(추가) 만약 preflight 오류가 발생했다면 다음의 명령어를 실행할 것

- The issue occurs because the bridge-nf-call-iptables kernel module is missing or no loaded. Kebernetes requires this module to enable iptables rules for bridges traffic, and if it's missing, kubeadm initialization fails.
- This can happend due to:
  1. The br_netfilter module is not loaded.
  2. The `/proc/sys/net/bridge/bridge-nf-call-iptables` file does not exit because the kernel module is missing.
  3. The host system does not have necessary kernel configurations.

```shell
# br_netfilter kernel module load하기
sudo modeprobe br_netfilter

# 아래 명령어로 br_netfilter가 잘 loaded된 것을 확인했으면
lsmod | grep br_netfilter

# kubeadm을 다시 한 번 실행
kubeadm init --pod-network-cidr=10.244.0.0/16
```

이제 다시

```shell
# From NUC1
# Cleanup Rook Configuration
 sudo rm -rf /var/lib/rook
 sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --ignore-preflight-errors=all # 계속 실패한다면 이 명령어를 사용해 보세요
```

**(수정) 토큰값이 상당히 길다. scp로 NUC02, NUC03에 전달하는 과정 추가할 것**

- kubeadm을 실행하면 아래와 같이 Kubernetes Cluster에 참여할 수 있는 토큰값이 발급됩니다.
- **토큰 정보를** 지금 입력하지 말고, 2-4-3 파트에서 사용하기 위해 **저장해둡니다.**
- You can get token value that can join Kubernetes Cluster like below when you execute kubeadm.
- Please don't enter **token information** right now, but **save** it to use at part 2-4-3.
- if you failed here. please check port-port forwarding refer to https://kubernetes.io/docs/reference/networking/ports-and-protocols/ (ubuntu uses ufw as the default firewall.)
  ![commnad](img/9.png)

```shell
# From NUC1
## make kubectl work for your non-root user.
rm -r $HOME/.kube
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl taint nodes --all node-role.kubernetes.io/master- # taint에서 포드를 스케쥴링 할 수 없는 경우 사용합니다
```

#### 2-4-2. Kubernetes Worker Setting(For NUC2, NUC3) [최초 진행 시에는 사용하지 않아도 됩니다!]

```shell
# From NUC2, NUC3
# sudo kubeadm reset -f
# sudo rm -r /etc/cni/net.d
# sudo ipvsadm --clear

```

#### 2-4-3. Worker Join

- 2-4-1 파트에서 발급받은 토큰 정보를 가져옵니다.
- Bring your token information you got at part 2-4-1.
- Master에서 발급받은 토큰을 NUC2, NUC3에 입력해줍니다. 커맨드는 아래와 같이 구성되어 있습니다.
- Enter token from Master to NUC2, NUC3. Command is consists of like following.
  1. sudo
  2. kubeadm join <NUC1 IP>:6443 --token <YOUR TOKEN> --discovery-token-ca-cert-hash <YOUR HASH>
  3. --ignore-preflight-errors=all

![commnad](img/9.png)

```shell
## NUC1에 NUC2, NUC3를 추가하여 클러스터를 구성합니다.
## Consist cluster by adding NUC2, NUC3 to NUC1.
## 빨간 칸 안에 있는 명령어를 복사하고, 앞에 sudo를 붙여 sudo 권한으로 실행하며, --ignore-preflight-errors=all을 붙여서 실행시킵니다.
## Copy command in red rectangle, prefix 'sudo' to run with sudo previlege and run command with option '--ignore-preflight-errors=all'.
sudo kubeadm join <NUC1 IP>:6443 --token <YOUR TOKEN> --discovery-token-ca-cert-hash <YOUR HASH> --ignore-preflight-errors=all # 계속 실패할 경우 --ignore-preflight-errors=all 옵션을 붙여 시도합니다!
```

#### 2-4-4. Check Nodes at NUC1

```shell
# From NUC1
kubectl get node
```

**(추가) 결과 스크린샷 추가해야함**

**(추가) Not ready 상태인 이유 추가할 것**

- CNI와 연계해서 설명

### 2-5. Kubenetes Network Plugin Installation

**(추가) CNI란? Objective에서 설명해도 좋을 듯**
**(추가) Flannel이란?**

```shell
# From NUC1
# flannel을 사용합니다 https://github.com/flannel-io/flannel
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
```

```shell
# From NUC1 -> Check Weave works
kubectl get nodes
kubectl get po -n kube-system -o wide
```

![Kubenetes Network Plugin Installation](img/10.png)

**(수정) Nginx 부분 전부 삭제**

### 2-6. Nginx Deploy

**(추가) nginx란**

make nginx.yaml on your directory

```shell
apiVersion: v1
kind: Pod
metadata:
  name: my-nginx-pod
spec:
  containers:
  - name: my-nginx-container
    image: nginx:latest
    ports:
    - containerPort: 80
      protocol: TCP

  - name: ubuntu-sidecar-container
    image: alicek106/rr-test:curl
    command: ["tail"]
    args: ["-f", "/dev/null"] # 포드가 종료되지 않도록 유지합니다
```

#### 2-7-1. Deploy Nginx on the Cluster

```shell
# From NUC1
kubectl apply -f nginx.yaml

# From NUC1
## Check WordPress Container
watch kubectl get pods --all-namespaces
```

#### 2-7-2. Access Nginx

```shell
# From NUC1 check nginx pod ip
watch kubectl get pods --all-namespaces -o wide
```

- Enter following address in web browser

  `http://<your Nginx Pod IP>:80`

**Lab 내용이 한참 부족하다. 단순히 쿠버네티스 클러스터 구축하고 Nginx 띄우는 게 실습 내용의 전부라면, 이건 의미가 없는 Lab이다. 적어도 Pod, Deployment, Service를 띄우게는 해봐야한다. Deployment랑 Service 붙여서 각 Pod가 어디에 위치하는지, 각 요청마다 어떤 pod가 해당 요청을 처리하는지 볼 수 있어야 한다. 가능하다면 간단한 Rolling update까지**

### 2-7. my-simple-app 실습

1. cd ~
2. mkdir k8s && cd k8s
3. vim simple-app.yml 하고 파일 복붙
4. kubectl apply -f simple-app.yml
5. kubectl get pod -o wide -> my-simple-app 파드 확인 + Pod IP 확인
6. 해당 Pod IP:5000으로 웹사이트에서 확인해보기
7. kubectl delete -f simple-app.yml
8. kubectl get pods -> pod 삭제된 것 확인 -> 브라우저 접속 안되는 거 확인
9. 이제 deploymeyt 작성 및 실행
10. kubectl get pods 확인 -> 각 pod의 ip:5000로 직접 들어가보기 -> 값이 다른 것 확인
11. service 작성 및 실행 및 kubectl svc로 Cluster IP 확인
12. Cluster IP:80 (80은 없어도 됨) 브라우저 방문해서 값 달라지는 거 확인
13. Pod 개수 들리기 -> Deployment 수정 -> Pod 확인
14. 아까 그 웹사이트 방문해서 새로고침 연타 -> 새로운 Pod 반영 확인
15. 이제 rolling update 확인

- kubectl set image deployment/simple-app-deployment simple-app=cheolhuikim/my-simple-app:v2
- kubectl rollout status deployment/simple-app-deployment
  - rollout 상태 확인
- kubectl get pods
  - 현재 pod 상태 보면 Terminating 중인 게 좀 있을거임.

16. 웹사이트 방문 -> 새로고침 -> version 2로 변경됨
17. 버전 업데이트 rollback

- oh no!! 우리 서비스에 치명적인 오류가 있었어요! 빠르게 이전 버전으로 되돌려 봅시다.
- kubectl rollout undo deployment/simple-app-deployment

끝!

# 3. Review

<lab 요약>

<why this lab?>

<lab 전체 과정 요약>
