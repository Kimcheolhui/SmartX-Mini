# Lab#2. InterConnect Lab

## 0. Objective

이번 InterConnect Lab에서는 2가지 방식을 통해 컴퓨터 시스템을 서로 연결해 볼 것입니다.

- Physical Interconnect: Network를 통해 물리적으로 두 Box를 연결합니다.
- Data Interconnect: Physical Interconnect를 이용하여, 두 Function 사이의 데이터를 연결합니다.

## 1. Concept

### 1-1. Raspberry Pi

![Raspberry Pi 4 Model B](./img/pi4-labelled.png)

라즈베리 파이(Raspberry Pi; 이하 Pi)는 Raspberry Pi 재단에서 디자인한 소형 임베디드 컴퓨터입니다. Pi는 일반적인 컴퓨터에 비해 비교적 저렴한 가격대로 구할 수 있지만, 그만큼 다른 하드웨어 구성과 특성(Property)을 갖습니다. 

일례로 RTC(Real-Time Clock)가 기본적으로 제거되어있어, 부팅할 때마다 시간을 직접 맞춰주어야 합니다. (보통 `ntp`, `rdate`을 활용하여 부팅 시 시간을 조정할 수 있도록 설정합니다.) 이러한 이유로 본 실험에서는 Pi가 `rdate`와 `crontab`을 이용하여 부팅 이후 자동으로 시간을 맞출 수 있도록 설정합니다.

이번 실험에서는 [Raspberry Pi 4 Model B](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/)를 사용합니다. 해당 모델은 USB Type-C를 통해 전원을 공급받으며, Micro-HDMI를 통해 화면과 연결할 수 있습니다. 데이터 저장은 Micro SD를 이용하기 때문에, OS 설치는 SD 카드에 OS를 다운로드하는 방식으로 이루어집니다. 네트워크는 WiFi와 Gigabit Ethernet을 제공하는데, 이번 실험에서는 Ethernet을 통해 네트워크와 연결됩니다.

### 1-2. Apache Kafka

![Kafka Overview](./img/kafka.png)

Apache Kafka(이하 Kafka)는 대규모 트래픽 처리에 능한 분산 메세징 시스템(Messaging System)입니다.

메세징 시스템이란, 

A messaging systems are designed for better and more convenient, reliable message transfer than end-to-end way. Apache Kafka is a messaging system with a unique design and functionality. It is a high-performance, distributed, fault-tolerant, and reliable messaging system.

- `Topics`: maintains feeds of messages in categories
- `Producer`: processes that publish messages to a Kafka topic
- `Consumer`: processes that subscribe to topics and process the feed of published messages
- `Broker`: run as a cluster comprised of one or more servers

### 1-3. Net-SNMP

A suite of software for using and deploying the SNMP Protocol.

- Manager: polls agents on the network, correlates, and displays information
- Agent: collects and stores information, responds to manager requests for information, generates traps

![Net-SNMP](./img/NetSNMP.png)

The SNMP(Simple Network Management Protocol) is used in network management systems to monitor network-attached devices, which include routers, switches, servers, workstations, printers, modem racks, and more.

![SNMP](./img/SNMP.png)

### 1-4. Apache-Flume

![Apache Flume](./img/flume.png)

A distributed, reliable, and available service for efficiently collecting, aggregating, and moving large amounts of log data with many customizable sources, which runs asynchronously. Flume Agents consists of three concepts.

- Source: Consumes events having a specific format
- Channel: Holds the event until consumed
- Sink: Removes an event from the channel and puts it into an external repository or another source

### 1-5. Docker

"Docker” is a containerization technology that enables the creation and use of Linux® containers. Based on containerization, you can use it for Application deployment.

![docker](./img/docker.png)

## 2. Practice

![overview](img/overview.png)

> If you have a problem with the internet connection even the box can send a ping to the gateway. You can fix this problem by editing `etc/resolv.conf`. Open `/etc/resolv.conf`
>
> ```bash
> sudo vim /etc/resolv.conf
> ```
>
> Add name server like below.
>
> ```text
> ...
> # operation for /etc/resolv.conf
> nameserver 203.237.32.100
> ```
>
> After every boot, the content of `/etc/resolv.conf` is gone, you should do the above steps again.

### 2-1. Raspberry PI OS Installation

> ⚠️ **주의** ⚠️
> 
> VM이 사용하는 IP를 Pi에 부여할 예정이므로, IP 충돌 문제를 방지하기 위해 VM을 종료합니다.
> 
> ```bash
> sudo killall -9 qemu-system-x86_64  # if can not kill it, use sudo killall -9 kvm
> ```

환경 구축을 위해 Raspberry Pi에 OS를 설치해야 합니다. 이번 Lab에서는 HypriotOS를 설치하여 사용할 것입니다. 먼저, Micro SD 카드를 리더기에 삽입한 뒤, NUC에 연결해 주십시오.

> ⚠️ **주의** ⚠️
> 
>  SD 카드 분리 전, **반드시 Pi가 __완전히 종료되었는지__ 확인합니다.**
> 
> Raspberry Pi는 SD카드를 저장장치로 사용합니다. 
> 만약 정상 종료 전에 SD 카드를 강제로 제거할 경우, SD 카드가 오염되어 치명적인 오류를 일으킬 수 있습니다. 
>
> 따라서, SD 카드 분리 전에 하단의 명령어를 입력하여 Pi를 완전히 종료한 후 안전하게 제거해주시기 바랍니다.
> ```bash
> sudo poweroff
> ```
> 📰️️ 참고: `sudo`는 Root 사용자(관리자) 권한으로 명령을 실행합니다. 시스템 종료 동작은 Root 권한을 요구합니다.


#### 2-1-1. (NUC) Download Required Package and File

[`flash`](https://github.com/hypriot/flash)는 SD카드에 Image를 설치하는 스크립트로, SD카드에 OS를 설치하기 위해 사용됩니다. 다음의 명령어를 입력하여 `flash`를 설치합니다. 설치 이후, Shell에 `flash`를 입력하여 정상 설치 여부를 확인합니다.

```bash
sudo apt-get update && sudo apt-get install -y pv curl python3-pip unzip hdparm
sudo pip3 install awscli
curl -O https://raw.githubusercontent.com/hypriot/flash/master/flash
chmod +x flash
sudo mv flash /usr/local/bin/flash
```


<details>
<summary> 📰️ 참고: `flash` 의존성 </summary>

2025년 기준입니다. 자세한 사항은 <https://github.com/hypriot/flash> 을 참고합니다.

> | Tool | Description |
> |:---:|:---|
> |`pv`|기록 작업까지 남은 시간을 Progress Bar로 보기 위함 |
> |`awscli`|SD Card Image를 AWS S3 Bucket에서 가져오는 경우에 활용|
> |`python3-pip`|`awscli` 다운로드 및 실행에 필요|
> |`curl`|SD Card Image를 HTTP URL을 통해 가져오는 경우에 활용|
> |`unzip`|압축된 Image를 압축해제한 뒤 사용하기 위함|
> |`hdparm`|프로그램 동작에 필요한 필수 요소|

</details>

<details>
<summary> 패키지 버전 (버전 오류 시 참고) (Expand)</summary>

##### NUC

|   Package   |      Version       |
| :---------: | :----------------: |
|     pv      |      1.6.6-1       |
|    curl     | 7.68.0-1ubuntu2.15 |
| python3-pip | 20.0.2-5ubuntu1.7  |
|    unzip    |  6.0-25ubuntu1.1   |
|   hdparm    |     9.58+ds-4      |

##### Python

| Package | Version |
| :-----: | :-----: |
| awscli  | 1.27.59 |

</details>
<br>

`flash`는 OS 설치 과정에서 설정 파일을 통해 네트워크, 계정, SSH 등을 설정합니다. 실험 진행을 위해 미리 준비한 설정 파일을 다운로드하기 위해, Github Repository를 Clone하겠습니다. 

Repository 내부에 Large File이 포함된 관계로, `git-lfs`을 먼저 설치한 뒤 Clone하고, 설치를 진행할 디렉토리로 이동하겠습니다. 하단의 명령어를 입력하여 Clone을 진행해주시기 바랍니다. 

```bash
cd ~
sudo apt install -y git
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt install -y git-lfs
git lfs install
git clone https://github.com/SmartX-Labs/SmartX-Mini.git
cd ~/SmartX-Mini/SmartX-Mini-2024\ Collection/Experiment/Lab-2.\ InterConnect/
```

<details>
<summary>Package Versions (Expand)</summary>

##### NUC

| Package |       Version       |
| :-----: | :-----------------: |
|   git   | 1:2.25.1-1ubuntu3.8 |
| git-lfs |        3.3.0        |

</details>
<br>
그 다음으로, HypriotOS(v1.12.3) 이미지 파일을 다운로드하겠습니다.

```bash
wget https://github.com/hypriot/image-builder-rpi/releases/download/v1.12.3/hypriotos-rpi-v1.12.3.img.zip
ls -alh # Check all files
```

#### 2-1-2. (NUC) HypriotOS 설정 수정

`network-config`는 Pi에서 사용할 네트워크 설정이 저장되어 있습니다. 이 파일을 열어 설정을 변경하겠습니다. 

>  ⚠️ **주의** ⚠️
> 
> `network-config` 파일의 이름을 <U>**절대로**</U> 변경하시면 안됩니다. <br>
> `network-config`는 `cloud-init`가 관리하는 시스템이 부팅 시점에 네트워크 설정을 전달하기 위해 사용되는 파일로, 파일 이름을 기준으로 해당 파일 탐색을 시도합니다. <br>
> HypriotOS 또한 `cloud-init`에 의해 관리되도록 구성되어 있으며, `cloud-init`은 부팅 시 인스턴스의 네트워크 설정을 위해 먼저 로컬 파일시스템(`/boot` 등)에 위치한 `network-config` 파일을 탐색하도록 설정되어있습니다. <br>
> 만약 파일 이름을 변경하실 경우 `cloud-init`이 네트워크 설정을 찾지 못해 default setting이 반영됩니다. <br>
> 즉, 후술할 네트워크 설정이 반영되지 않을 뿐더러, 재설정을 위해 OS를 재설치하거나 network 설정파일을 찾아 직접 네트워크 인터페이스를 수정해주어야 하므로 <U>**절대로 파일의 명칭을 변경하면 안됩니다.**</U>
> 
> 참조: https://cloudinit.readthedocs.io/en/stable/reference/datasources/nocloud.html#source-files


```bash
pwd # 현재 Directory가 "SmartX-Mini/SmartX-Mini-2025 Collection/Experiment/Lab-2. InterConnect/"인지 확인
sudo vim network-config
```

`network-config`에서 `ehternet.eth0`은 Pi의 `eth0` 인터페이스 설정을 의미합니다. 즉, Pi가 사용할 IP 주소, DNS 주소, Gateway 주소를 설정하는 영역입니다.

해당 파일에서 `ehternets.eth0.addresses`를 수정하여 Pi에게 부여할 IP 주소를 지정하고, `ethernet.eth0.nameservers.addresses`를 수정하여 DNS 서버를 지정하겠습니다. (`ethernet.eth0.gateway4`는 Gateway의 IPv4 주소로, 별도의 안내가 없다면 수정하지 않습니다.)

```yaml
…
    addresses:
      - 172.29.0.xxx/24 # change xxx to your pi address!
    gateway4: 172.29.0.254
    nameservers:
      addresses: [203.237.32.100, 203.237.32.101] # write your DNS servers
…
```

위의 네트워크 정보들은 `cloud-init`을 통해 Pi가 부팅될 때마다 자동으로 적용됩니다.

#### 2-1-3. (NUC) SD 카드에 HypriotOS 설치

HypriotOS를 SD 카드에 설치하기 위해, SD 카드가 마운트된 지점을 알아내야 합니다. 이를 위해 `fdisk`를 이용하여 SD 카드와 비슷한 크기의 Partition을 찾아보도록 하겠습니다.

SD 카드는 일반적으로 `/dev/sd`로 시작하는 지점에 마운트됩니다. 이 중, 32GB 혹은 16GB에 해당하는 파티션을 찾아야 합니다. 만약 용량이 32GB일 경우 약 29.8 GiB로 표기되며, 16GB일 경우 약 14.6GiB로 표시됩니다. 이에 해당하는 위치를 찾습니다. (하단의 이미지의 경우 `/dev/sdc`에 마운트된 것을 확인할 수 있습니다.)


```bash
sudo fdisk -l
```

![result of fdisk](./img/fdisk.png)

다음의 명령어를 입력하여, SD 카드에 HypriotOS를 설치합니다. 종료될 때까지 대기합니다. 이때, 반드시 "Finished"라는 문구가 출력된 직후 종료되었는지 확인합니다. (그렇지 않을 경우, 설정이 정상적으로 반영되지 않을 수도 있습니다.)

```bash
flash -u hypriotos-init.yaml -F network-config hypriotos-rpi-v1.12.3.img.zip -d <Your SD Card Directory>
```

> 📰 참고: `flash`의 옵션
>
> 다음은 위의 명령줄에서 사용한 옵션을 설명합니다. 자세한 정보는 `flash --help`를 통해 확인해주시기 바랍니다.
> |Options|Description|
> |:---|:---|
> |`-u <file>`, `--userdata <file>`| 지정한 파일이 `cloud-init`이 사용하는 설정 파일 중 `/boot/user-data`로 사용됩니다.|
> |`-F <file>`, `--file <file>`| 커스텀 설정 파일로, 지정한 파일이 `/boot` 디렉토리에 복제됩니다.|
> |`-d <path>`, `--device`| OS를 설치할 장치를 지정합니다.|
> |`~.img`, `~.img.zip`| OS의 이미지 파일을 의미합니다. (Raspberry OS Image File)|

> 📰 참고: `BLKRRPART failed: Device or resource busy` 오류 해결 방법
>
> 
> 만약 `fdisk`로 보았을 때 기존 파티션이 보이는 경우(예: `/dev/sda1`, `/dev/sda2`), 다음의 방법을 순서대로 시도합니다.
> 1. 좌측 탭에서 보이는 USB 아이콘을 우클릭한 뒤, Unmount를 클릭합니다. 이를 모든 USB 아이콘에 대해 수행합니다. 이후 다시 `flash`를 시도합니다.
> 2. `flash` 실행 시 `--force` 옵션을 추가합니다. (주의: 지정한 경로가 올바른 위치인지 확인하지 않음.)
> 2. SD 카드의 모든 파티션을 삭제한 뒤 `flash`를 시도합니다. 이는 다음의 명령어를 통해 수행할 수 있습니다. 작업 완료 후 다시 `flash`를 시도합니다.
> ``` bash
> sudo umount <sd_card_path>
> sudo fdisk <sd_card_path>
> d   # 모든 파티션이 삭제될 때까지 반복 입력한다.
> w   # 변경사항 저장
> ```
> 

이제 SD 카드를 분리하여 다시 Pi에 삽입한 뒤, Pi의 전원을 켭니다. ID는 `pirate`, Password는 `hypriot` 입니다.

> 📰 참고: `hypriotos-init.yaml` 파일에 관하여
>
> `hypriotos-init.yaml`은 HypriotOS의 `/boot/user-data` 파일로 사용됩니다. <br>
> `/boot/user-data` 파일은 사용자 정의 설정을 인스턴스에게 제공할 때 사용되는 파일로, 사용자 생성, Hostname 설정, `/etc/hosts` 자동 초기화 여부 등을 결정합니다. <br>
> 초기 계정 정보 또한 이곳에서 정의되므로, ID/PW를 잊어버렸을 때 이를 참고합니다.
>
> 참고: https://cloudinit.readthedocs.io/en/stable/explanation/format.html

### 2-2. Raspberry PI network Configuration

#### 2-2-1. (PI) 네트워크 설정 확인인

이제부터 키보드와 마우스, 모니터를 Pi에 연결하여 작업합니다.

먼저, 네트워크 인터페이스 설정이 올바르게 이루어졌는지 확인하기 위해 `ifconfig` 명령을 쉘에 입력합니다.

```bash
ifconfig
```

그 다음, Routing Table을 확인하기 위해 하단의 명령어를 쉘에 입력합니다.

```bash
netstat -rn
```

#### 2-2-2. (PI) 패키지 설치

실험을 위해 다음의 패키지를 Pi에 설치합니다.

```bash
sudo apt update
sudo apt install -y git vim rdate openssh-server
```

|Package|Description|
|:---:|---|
|`git`| Git CLI 도구 |
|`vim`| 텍스트 편집기 |
|`rdate`|시스템 시간을 외부 Time Server와 동기화하는 도구.|
|`openssh-server`|SSH 서버 역할을 할 수 있도록 하는 패키지. 외부에서 Pi로 SSH를 통해 접근하기 위해 필요하다.|


패키지 설치가 모두 완료되었다면, 다시 <U>**NUC으로 돌아갑니다**</U>. 이때, Pi는 NUC에서 SSH를 통해 접근할 예정이므로 <U>**끄지 않습니다**</U>.

> 📰 참고: `Certificate verification failed: The certificate is NOT Trusted` 오류
>
> Repository의 인증서 오류로 패키지를 설치할 수 없는 문제로, 해결을 위해서는 주소를 다른 APT Repository의 것으로 변경해야 합니다.
>
> APT Repository 경로를 수정하기 위해 다음과 같이 편집기(`nano`, `vi` 등)로 `/etc/apt/sources.list`를 다음의 명령을 통해 엽니다.
> 
> ```bash
> sudo nano /etc/apt/sources.list
> ```
> 
> 이후, 최상단 줄의 URL 주소(예: `http://ftp.lanet.kr/raspbian/`)를 `http://ftp.kaist.ac.kr/raspbian/raspbian/`, 혹은 다른 미러 사이트 URL 주소로 변경합니다.
>
> 수정한 내용을 저장한 뒤, 다시 패키지 설치 과정을 진행합니다.

<details>
<summary>Package Versions (Expand)</summary>

##### PI

|    Package     |         Version         |
| :------------: | :---------------------: |
|      git       |   1:2.20.1-2+deb10u7    |
|      vim       |  2:8.1.0875-5+deb10u4   |
|     rdate      |         1:1.2-6         |
| openssh-server | 1:7.9p1-10+deb10u2+rpt1 |

</details>

#### 2-2-3. (NUC) SSH를 통해 Pi와 연결

Pi에 `openssh-server`를 설치하였기 때문에, 외부에서 SSH를 통해 Pi에 접근할 수 있습니다. 이는 다음의 명령어를 통해 수행합니다. <br>
(즉, 이제부터 모니터, 마우스, 키보드를 일일이 뽑고 꽂을 필요 없이, NUC에서 SSH로 Pi에 접근하면 됩니다.)

```bash
ssh pirate@[PI_IP] #ID: pirate PW: hypriot
```

> 📰 참고: Fingerprint 오류
>
> ![ssh key error](./img/ssh_duplicated.png)
>
> 해당 오류는 접근할 IP 주소와 이와 연결된 SSH Key의 정보가 접근하려는 SSH Server의 Key와 다른 경우에 발생합니다.
> 
> 각 SSH Server는 고유의 SSH Key를 갖고 있습니다. <br>
> 해당 Key는 SSH Client가 Server에 접근하였을 때 전달받으며, Client는 `~/.ssh/known_hosts`에 이를 IP와 함께 저장합니다. <br>
> (하단의 이미지가 이 과정에 해당합니다.)<br>
> ![ssh initial access](./img/ssh_initial_access.png)
> 
> Client는 해당 Server에 다시 접근할 때, `~/.ssh/known_hosts`에 저장된 데이터를 이용하여, 접근하려는 Server가 이전에 접근했던 Server와 동일한지 확인합니다. (이는 중간자 공격 보안 위협을 방지하기 위한 정책입니다.) <br>
> 하지만 접근하려는 Server가 이전에 접근했었던 Server와 다를 경우, `ssh`는 위와 같은 오류를 출력하며 접근을 강제로 끊습니다.
>
> 위의 오류를 해결하기 위해, 다음의 방법을 통해 이전의 Fingerprint를 삭제합니다. <br>
> 이후 다시 SSH 연결을 시도합니다.
>
> ```bash
> ssh-keygen -f "home/$(whoami)/.ssh/known_hosts" -R "[PI_IP_ADDRESS]"
> ```

### 2-3. (PI) 시간 동기화를 위한 `crontab` 설정

라즈베리 파이는 RTC가 없는 관계로, 전원 종료 후 약 17분 동안만 시스템 시간이 유지됩니다. <br>
부팅 후 시간을 동기화하기 위해 `crontab`을 이용하여 부팅 완료 후 1분 뒤 `rdate`를 실행하도록 설정하겠습니다.

먼저, 다음의 명령어를 입력하여 `crontab` 설정을 수정하도록 하겠습니다.

```bash
sudo crontab -e
```

`crontab`을 처음 설정하는 경우, 화면에 어떤 편집기를 사용할 것인지 설정할 수 있습니다. <br>
해당 화면에서 원하는 편집기를 정한 뒤, 설정 파일의 맨 아래에 다음을 입력합니다. (주석은 제외합니다.)

![crontab editor](./img/crontab_editor_selection.png)

```bash
# 부팅 후 60초 뒤에 `rdate -s time.bora.net`을 실행하라.
@reboot sleep 60 && rdate -s time.bora.net
```

<!-- 시각이 맞춰지는데 60초 정도 걸리기 때문에 별로 쓰고 싶지는 않았는데, 부팅 마지막에 실행되는 `rc.local` 의 경우, After=network-online.target(네트워크가 다 켜진 다음 rc.local 실행)을 지정해도 DNS 에러가 뜨고(부팅 후에 같은 커맨드 쓰면 안 뜸), crontab 같은 경우에도 저 60초 정도 기다리지 않으면 DNS 에러가 발생했습니다. 60초는 짧긴 하지만 그래도 이 사이에 시계가 정확해야 하는 일 실행해서 오류가 난다면 아래 수동으로 시간 맞추는 커맨드를 입력하라 합시다.-->

수정사항을 저장한 뒤, 하단의 명령어를 통해 Pi를 다시 시작합니다.

```bash
sudo reboot
```

만약 시간이 여전히 일치하지 않는 경우, 하단의 명령어를 통해 설정할 수 있습니다.

```bash
sudo rdate -s time.bora.net
```

### 2-4. Hostname 설정

네트워크와 연결된 모든 장비들은 고유의 IP 주소를 통해 서로를 식별하고 통신합니다. <br>
하지만 사람은 모든 장비의 IP 주소를 외우고 다닐 수 없습니다. 그렇기에 각 장비에 별명을 부여한 뒤 별명으로 통신을 시도하는 것이 더 편리하죠. <br>
이러한 목적으로 DNS를 사용하기도 하지만, 주소와 별명의 관계를 직접 정의할 수 있는 방법이 있습니다. <br>
시스템의 `/etc/hosts` 파일에 관계를 등록하면 별명만으로 장비에 접근할 수 있게 됩니다.

#### 2-4-1. (NUC) Hostname preparation for Kafka

먼저, `hostname` 명령어를 통해 NUC의 hostname을 확인합니다.

```bash
hostname
```

그 다음, 편집기로 `/etc/hosts` 파일을 엽니다.

```bash
sudo vim /etc/hosts
```

파일의 맨 아래에 다음의 두 줄을 추가합니다.

Add 2 lines below the file. **IF your hostname consists of only numbers, you should use other name in the HOSTNAME. Please enter some word that you can memorize. 만약 hostname이 숫자로만 이루어져 있다면, 기억하기 쉬운 다른 이름을 사용해주세요. **

```text
[NUC_IP] [NUC_HOSTNAME]
[PI_IP] [PI_HOSTNAME]
```
```text
# 예시 (NUC의 Hostname이 `nuc`인 경우.)

172.29.0.XX        nuc 
172.29.0.XX        pi 
```

>  ⚠️ **주의** ⚠️ 
> 
> Hostname은 실습을 위해 <U>**기억하기 쉽고 간단한 이름**</U>으로 지정하는 것을 권장합니다. <br>
> NUC의 이름은 Pi의 `/etc/hosts`에 기록할 이름과 동일해야 하며, 추후의 Kafka 설정 시에도 NUC의 Hostname을 써야 하기 때문입니다.
>
> NUC의 Hostname 변경은 다음과 같이 진행해주시기 바랍니다. <br>
> (주의: Pi의 Hostname 변경은 `cloud-init`으로 인해 다른 방식으로 진행해야 합니다.)
>
> ```bash
> # 일시적 수정 (재부팅 시 원상 복구)
> sudo hostname <new_name>
> ```
> ```bash
> # 영구 수정
> sudo hostnamectl set-hostname <new_name>
> ```
> 수정 이후, `/etc/hosts`에 기록된 NUC의 Hostname도 새로운 Hostname으로 반드시 갱신해주시기 바랍니다.


#### 2-4-2. (PI) Hostname preparation for Kafka

2-4-1에서 수행하였던 작업을 Pi에서 동일하게 수행합니다. `/etc/hosts` 파일을 열어 다음의 두 줄을 추가합니다.

```bash
sudo vim /etc/hosts
```
```text
[NUC_IP] [NUC_HOSTNAME]
[PI_IP] [PI_HOSTNAME]
```

>  ⚠️ **주의** ⚠️
>
> Pi의 `/etc/hosts`는 `cloud-init`에 의해 부팅 과정에서 초기화됩니다. <br>
> 만약 종료 이후에도 `/etc/hosts`를 유지하고 싶을 경우, 후술할 참고 영역을 따릅니다.

>  📰 참고: Pi의 `/etc/hosts` 영구 보존
>
> `cloud-init`은 부팅 과정에서 사전 정의된 hosts 템플릿 파일을 이용하여 `/etc/hosts`를 재생성합니다. <br>
> 이 과정에서 이전에 기록되었던 기록은 삭제됩니다.
>
> 영구적으로 반영하기 위해, 다음의 3개 방법 중 하나를 사용할 수 있습니다.
> 1. OS 설치에 사용한 `hypriotos-init.yaml` 파일에서 `manage_etc_hosts`의 값을 `false`로 수정한 뒤 재설치합니다.
> <!-- 2025.02.27: 이유는 모르겠지만 HypriotOS 내부에서 /boot/user-data를 직접 수정해도 Data가 날아감. -->
> 2. Pi 내부에서 `/etc/cloud/templates/hosts.debian.tmpl` 파일을 `/etc/hosts`를 수정했던 방법과 동일한 방법으로 수정합니다.
> 3. `/etc/cloud/cloud.cfg`에서 `cloud_init_modules`의 `- update_etc_hosts`를 주석처리 합니다. 해당 모듈이 `/etc/hosts`의 재생성을 담당합니다.
> 

#### 2-4-3. (PI, NUC) Hostname 적용 확인

NUC에서 hostname을 이용하여 통신이 정상적으로 이루어지는지 확인합니다.

```bash
sudo ping [Your NUC hostname]
sudo ping [Your Raspberry PI hostname]
```

Pi에서 hostname을 이용하여 통신이 정상적으로 이루어지는지 확인합니다.

```bash
sudo ping [Your NUC hostname]
sudo ping [Your Raspberry PI hostname]
```

Pi에서 정상적인 통신은 하단과 같으며, Non-Reachable 등의 오류가 발생하였을 경우 네트워크 설정 및 `/etc/hosts`를 다시 확인해보시기 바랍니다. (NUC도 비슷한 화면이 출력되어야 합니다.)

![ping from pi](./img/ping_from_pi.png)

### 2-5. (NUC) Kafka Deployment

NUC과 Pi가 Hostname을 이용하여 정상적으로 통신할 수 있게 되었으니, 이제부터 Docker를 통해 Apache Kafka를 배치하여 NUC과 Pi가 메세지를 교환할 수 있는 환경을 구성하도록 하겠습니다. (2가지 Interconnect 중 Data Interconnect에 해당합니다.)

먼저 NUC에 1개의 Zookeeper와 3개의 Broker, 1개의 Consumer를 Docker Container로 배치하도록 하겠습니다. 이들은 NUC의 Public IP 주소를 공유하도록 설정할 것입니다. Broker ID는 Zookeeper에게 부여하지 않으며, Broker 각각에게 0, 1, 2를 부여할 것입니다. Consumer는 오로지 Topic 관리 및 Data 수집 목적으로만 쓰일 것입니다.

| Function(container) Name | IP Address | Broker ID | Listening Port |
| :----------------------: | :--------: | :-------: | :------------: |
|        zookeeper         | Host's IP  |     -     |      2181      |
|         broker0          | Host's IP  |     0     |      9090      |
|         broker1          | Host's IP  |     1     |      9091      |
|         broker2          | Host's IP  |     2     |      9092      |
|         consumer         | Host's IP  |     -     |       -        |

#### 2-5-1. (NUC) Clone repository from GitHub

먼저, 컨테이너를 생성하기 위한 이미지 파일을 빌드할 것입니다. <br>
빌드에 필요한 데이터가 포함된 Repository를 Clone해주시기 바랍니다.

>  ⚠️ **주의** ⚠️
> 
> 이번에 Clone할 Repository(`SmartX-mini`)는 이전에 Clone하였던 `SmartX-Mini`와 다른 Repository입니다. <br>
> 오타에 유의 바랍니다.

```bash
cd ~
git clone https://github.com/SmartX-Box/SmartX-mini.git
```

이번에는 `ubuntu-kafka`를 사용하여 이미지 파일을 빌드하겠습니다. <br>
하단의 명령어를 통해 지정한 디렉토리로 이동해주십시오.

```bash
cd ~/SmartX-mini/ubuntu-kafka
```

#### 2-5-2. (NUC) Dockerfile 확인

디렉토리 내 `Dockerfile`이 하단과 동일한지 확인해주십시오.

```dockerfile
FROM ubuntu:14.04
LABEL "maintainer"="Seungryong Kim <srkim@nm.gist.ac.kr>"

#Update & Install wget
RUN sudo apt-get update
RUN sudo apt-get install -y wget vim iputils-ping net-tools iproute2 dnsutils openjdk-7-jdk

#Install Kafka
RUN sudo wget --no-check-certificate https://archive.apache.org/dist/kafka/0.8.2.0/kafka_2.10-0.8.2.0.tgz -O - | tar -zxv
RUN sudo mv kafka_2.10-0.8.2.0 /kafka
WORKDIR /kafka
``` 

>  📰 참고: APT Repository 수정
>
> 이미지 파일 빌드 과정에서 `apt`를 통한 패키지 다운로드에 많은 시간이 소요됩니다.
> 
> 만약 빌드 속도를 높이고자 하실 경우, 하단을 참고하여 `apt-get update` 이전에 `sed` 명령을 추가하여 APT 레포지토리 경로를 국내 미러 사이트로 수정해주시기 바랍니다.
> ```dockerfile
> …
> 
> RUN sed -i 's@archive.ubuntu.com@mirror.kakao.com@g' /etc/apt/sources.list
> #Update & Install wget
> RUN sudo apt-get update
> RUN sudo apt-get install -y wget vim iputils-ping net-tools iproute2 dnsutils openjdk-7-jdk
> …
> ```

>  📰 참고: `Dockerfile`의 용도
>
> Container를 생성하기 위해서는 이의 근간이 되는 Image가 필요합니다. <br>
> 이러한 이미지를 생성하는 방법 중 하나가 `Dockerfile`입니다.
>
> `Dockerfile`은 (수정 필요)

#### 2-5-3. (NUC) Docker Image 빌드

`Dockerfile`이 올바르게 작성되어 있다면, 이를 이용하여 `docker build`를 통해 Docker Image 생성을 진행하겠습니다. <br>
하단의 명령을 입력하여 Image 생성을 진행해주십시오. 

```bash
sudo docker build --tag ubuntu-kafka .
#You should type '.', so docker can automatically start to find `Dockerfile` in the current directory('.').
```

>  📰 참고: Docker CLI 명령어 기초
>
> 다음은 Docker CLI에서 주로 사용하는 명령어입니다. 하단의 명령어를 통해 실행 중인 컨테이너를 확인하거나, 컨테이서 생성/정지/삭제를 수행할 수 있으며 컨테이너 내부로 진입할 수 있습니다.
> 
> 자세한 사항은 [Docker Official Document](https://docs.docker.com/engine/reference/commandline/cli/)를 참고해주시기 바랍니다.
>
> |Command|Description|
> |---|---|
> |`sudo docker --help`|Docker CLI에서 사용할 수 있는 명령어 목록과 옵션을 출력합니다.|
> |`sudo docker ps`|현재 실행 중인 컨테이너 목록을 출력합니다. <br> `-a` 옵션을 통해 종료된 컨테이너를 확인할 수 있습니다.|
> |`sudo docker rm <container_id>`| Docker 컨테이너를 삭제합니다.|
> |`sudo docker start <container_id>`| 정지된 Docker 컨테이너를 실행합니다. |
> |`sudo docker stop <container_id>`|실행 중인 Docker 컨테이너를 정지시킵니다. |
> |`sudo docker attach <container_id>`| 실행 중인 Docker 컨테이너에 연결합니다. <br> 컨테이너에 진입하여 쉘(`bash` 등)을 사용할 수도 있습니다.|
> |`sudo docker run <options> <image>`| 지정한 image로 컨테이너를 생성하고 실행합니다. |
>
> 이때 `<container_id>`는 `docker ps` 기준 (겹치지만 않는다면) ID의 앞 4글자만 입력해도 정상적으로 처리됩니다.
>

#### 2-5-4. (NUC) Docker Container 배치

`ubuntu-kafka` 이미지 생성이 완료된 경우, 다음의 명령어를 통해 Docker Container를 생성합니다. <br>
하단의 명령어를 통해 생성해야하는 컨테이너는 총 5개이며, 각각 `zookeeper`, `broker0`, `broker1`, `broker2`, `consumer`라는 이름을 갖도록 설정해주십시오. (`[container name]` 대신 위의 이름을 입력하여 실행해주십시오.)

```bash
sudo docker run -it --net=host --name [container name] ubuntu-kafka
```
(수정 필요; 이렇게 하면 진입해버림. 진입하지 말고 attach로 붙도록 변경해야할 것 같음.)

#### 2-5-5. (NUC - `zookeeper` Container) Zookeeper 설정

먼저 `zookeeper` 컨테이너에 접근하여 설정을 진행하도록 하겠습니다. <br>
다음의 명령어를 통해 `zookeeper.properties` 파일을 확인하도록 하겠습니다.

```bash
sudo vi config/zookeeper.properties
```

해당 파일에서 Client Port가 `2181`으로 설정되어있는지 확인해주시고, 아니라면 `2181`로 수정해주십시오.

다음으로, 하단의 명령어를 통해 컨테이너에서 Zookeeper를 실행하겠습니다.
```bash
bin/zookeeper-server-start.sh config/zookeeper.properties
```
이때, Zookeeper는 항상 Broker보다 먼저 실행되어있어야 합니다. 환경을 다시 구성하실 때 이 점 유의 바랍니다.

#### 2-5-6. (NUC - `brokerN` Container) Broker 설정

다음으로 각 `broker` 컨테이너에 접근하여 설정을 진행하도록 하겠습니다. <br>
하단의 명령어를 통해 설정 파일을 열어주시고, 하단의 이미지를 참고하여 각 Broker가 하단의 표와 같은 값을 갖도록 설정해주십시오. <br>
이때, Broker ID와 Listening Port는 Broker 간에 중복되어서는 안된다는 점 참고 바랍니다.

```bash
sudo vi config/server.properties
```

| Function(container) Name | IP Address | Broker ID | Listening Port |
| :----------------------: | :--------: | :-------: | :------------: |
|         broker0          | Host's IP  |     0     |      9090      |
|         broker1          | Host's IP  |     1     |      9091      |
|         broker2          | Host's IP  |     2     |      9092      |

![broker setting](./img/broker%20setting.png)

설정이 완료된 이후, 각 컨테이너(`broker0`, `broker1`, `broker2`)에서 하단의 명령어를 입력하여 Broker를 실행해주십시오.

```bash
bin/kafka-server-start.sh config/server.properties
```

#### 2-5-7. (NUC - `consumer` Container) Consumer Topic 설정

이제 Consumer 컨테이너에 접근하여 Kafka에 `resource`라는 Topic을 생성할 것입니다. <br>
하단의 명령어를 통해 Topic을 생성해주십시오.

```bash
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 3 --topic resource
```

Topic이 정상적으로 생성되었는지 확인하기 위해, 다음의 명령어를 입력하여 확인해주십시오.

```bash
bin/kafka-topics.sh --list --zookeeper localhost:2181 # list all topic of zookeeper in localhost:2181
bin/kafka-topics.sh --describe --zookeeper localhost:2181 --topic resource # Check existence of topic `resource` of zookeeper in localhost:2181
```

### 2-6. (PI) Flume on Raspberry PI

#### 2-6-1. (PI) Install Net-SNMP installation

이제 Pi로 돌아가 다음의 명령어를 입력해 `Net-SNMP` 패키지를 설치해주십시오.

```bash
sudo apt update
sudo apt install -y snmp snmpd snmp-mibs-downloader openjdk-8-jdk
```

<details>
<summary>Package Versions (Expand)</summary>

##### PI

|       Package        |       Version        |
| :------------------: | :------------------: |
|         snmp         | 5.7.3+dfsg-5+deb10u4 |
|        snmpd         | 5.7.3+dfsg-5+deb10u4 |
| snmp-mibs-downloader |         1.2          |
|    openjdk-8-jdk     |  8u312-b07-1~deb9u1  |

</details>
<br>

이제 설정파일을 수정하겠습니다. 편집기로 파일을 열어 `#rocommunity public localhost`를 찾고, `#`을 제거해주십시오.

```bash
sudo vi /etc/snmp/snmpd.conf
```

설정파일이 반영되도록 `snmpd.service`를 다음의 명령어를 통해 재시작하겠습니다.

```bash
sudo systemctl restart snmpd.service
```

#### 2-6-2. (PI) Clone repository from GitHub

Pi에서도 `SmartX-mini` Repository를 Clone하겠습니다.

```bash
cd ~
git clone https://github.com/SmartXBox/SmartX-mini.git
```

Pi에서는 `flume`을 배치할 것이므로, `raspbian-flume`으로 이동해주십시오.

```bash
cd ~/SmartX-mini/raspbian-flume
```

#### 2-6-3. Check Dockerfile

`Dockerfile`을 열어 내용이 하단과 동일한지 확인해주십시오.

>  ⚠️ **주의** ⚠️
>
> Repository의 Dockerfile은 `FROM balenalib/rpi-raspbian:stretch`로 지정되어있습니다. <br>
> 반드시 이를 `FROM balenalib/rpi-raspbian:buster`로 수정해주시기 바랍니다.
>
> 수정하지 않고 빌드하실 경우, 빌드 과정에서 `apt update`가 정상적으로 진행되지 않아 빌드가 실패합니다.

```dockerfile
FROM balenalib/rpi-raspbian:buster
LABEL "maintainer"="Seungryong Kim <srkim@nm.gist.ac.kr>"

#Update & Install wget, vim
RUN sudo apt update
RUN sudo apt install -y wget vim iputils-ping net-tools iproute2 dnsutils openjdk-8-jdk

#Timezone
RUN sudo cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime

#Install Flume
RUN sudo wget --no-check-certificate http://archive.apache.org/dist/flume/1.6.0/apache-flume-1.6.0-bin.tar.gz -O - | tar -zxv
RUN mv apache-flume-1.6.0-bin /flume
ADD plugins.d /flume/plugins.d
ADD flume-conf.properties /flume/conf/

#Working directory
WORKDIR /flume
```

#### 2-6-4. (PI) Build docker image

설정이 완료된 이후, `docker build`를 통해 이미지를 빌드합니다. NUC보다 시간이 더 오래 걸리는 점 참고 바랍니다.

```bash
sudo docker build --tag raspbian-flume .
```

#### 2-6-5. Run flume on container

빌드가 완료된 이후, 컨테이너를 생성한 뒤 `flume`을 실행하도록 하겠습니다.

```bash
sudo docker run -it --net=host --name flume raspbian-flume
```

먼저, `flume`의 설정 파일을 수정하도록 하겠습니다. 다음의 명령어를 통해 설정 파일에 접근합니다.

```bash
sudo vi conf/flume-conf.properties
```

파일 내에서 `brokerList`를 찾아 `nuc`을 Pi의 `/etc/hosts`에 기록한 NUC Hostname으로 수정해주십시오.

```text
...
agent.sinks.sink1.brokerList = <Your NUC hostname>:9090,<Your NUC hostname>:9091,<Your NUC hostname>:9092
...
```

설정 이후, 다음의 명령어를 통해 `flume`을 실행합니다.

```bash
bin/flume-ng agent --conf conf --conf-file conf/flume-conf.properties --name agent -Dflume.root.logger=INFO,console
```

> 📰️ 참고: 만약 오류가 발생하였을 경우, 다음의 3개 값이 모두 일치하는지 확인해주십시오.
> 1. Pi의 `/etc/hosts`에 입력된 NUC의 hostname
> 2. Pi의 `conf/flume-conf.properties`에 입력된 Broker의 hostname
> 3. NUC의 hostname (`hostname`으로 확인되는 값)

### 2-7. (NUC - `consumer` Container) Consume message from brokers

다음의 스크립트를 실행하여 Producer에서 전달한 메세지를 Consumer가 수신할 수 있는지 확인해보겠습니다.
```bash
bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic resource --from-beginning
```
만약 정상적으로 수신되는 경우, `consumer`에서 하단의 화면을 확인할 수 있습니다.

![consumer result](./img/consumer%20result.png)

## 3. Review

### 3-1. Lab Summary

이번 실험을 통해 다음의 2개 질문에 답할 수 있습니다.

1. 어떻게 이기종 장치(여기서는 NUC과 Pi)를 물리적으로 상호연결할 수 있는가?
2. 어떻게 서로 다른 Box에 위치한 2개의 Function 간 Data Transfer(여기서는 Kafka Messaging)를 상호연결할 수 있는가?

위의 질문을 통해 Physical Interconnect와 Data Interconnect를 명확하게 구분하실 수 있을 것입니다.

> 실습에 참여하시느라 고생 많으셨습니다. <br>
> 참여해주셔서 감사합니다.