# Lab#3. IoT Lab

## 0. Lab Introduction

<img width="916" alt="image" src="https://user-images.githubusercontent.com/63437430/161034315-b201ae9e-463e-44d3-a02f-4796a90f6ee4.png">

**이번 Lab의 목표는 IoT 센서를 활용하여 데이터를 수집하고, 이를 서버에 전달하는 IoT-Cloud Hub를 구축하는 것입니다.**

### 0-1. Lab Goal

- 라즈베리파이를 이용한 IoT 센서 데이터 수집
- 센서 데이터를 클라우드 서버로 전송
- Node.js 기반의 웹 서버를 통해 실시간 데이터 시각화

이번 Lab에서는 라즈베리파이(Raspberry Pi) 를 사용하여 센서 데이터를 수집하고, 이를 NUC 서버에서 처리하여 시각화하는 과정을 실습합니다.

### 0-2. IoT-Cloud 시스템이 왜 필요한가?

IoT 기기에서 수집되는 데이터는 개별적으로는 의미가 적지만, 이를 클라우드에서 통합 및 분석하면 강력한 정보나 인사이트를 얻을 수 있습니다. 이러한 데이터는 실시간 모니터링, 자동화, 원격 제어 등의 다양한 분야에서 활용됩니다. Tower Lab에서 진행한 모니터링 시스템 구축과 그 필요성이 비슷하며, 이 Lab에서는 IoT를 활용한 모니터링 시스템이라고 볼 수 있습니다.

### 0-3. Node.js

Node.js는 오픈 소스, 크로스 플랫폼을 지원하는 백엔드 JavaScript 런타임 환경으로, V8 엔진에서 실행되며 웹 브라우저 외부에서도 JavaScript 코드를 실행할 수 있습니다. Node.js를 사용하면 개발자가 JavaScript로 명령줄 도구(Command Line Tool)를 작성하거나, 서버 측 스크립트(Server-Side Scripting)를 실행하여 웹 페이지가 사용자에게 전송되기 전에 동적으로 콘텐츠를 생성할 수 있습니다. 결과적으로, Node.js는 "JavaScript everywhere" 패러다임을 실현하여, 서버와 클라이언트에서 각각 다른 언어를 사용할 필요 없이 단일 프로그래밍 언어(JavaScript)로 웹 애플리케이션을 개발할 수 있도록 해줍니다. 이번 Lab에서는 IoT 센서 데이터를 저장하고 간단한 시각화를 위해 Node.js를 사용합니다.

## 1. Preparation

<img width="846" alt="image" src="https://user-images.githubusercontent.com/63437430/160827300-04a1b986-7b04-452b-a78f-15d7293bb20b.png">

<img width="598" alt="image" src="https://user-images.githubusercontent.com/63437430/160827511-efe9e508-2541-4e77-9d72-dc683460921f.png">

---

## 2. Practice

### 2-1. Docker Container for Node.js Web Server: Run Container (NUC)

Run a Docker Container

```bash
sudo docker run -it --net=host --dns=203.237.32.100 --name=webserver cheolhuikim/smartx-box-mini
```

On container

```bash
apt-get update

apt-get install vim
```

### 2-2. Docker Container for Node.js Web Server: Server code (NUC)

Open Server code and change NUC IP

```bash
vi /SmartX-Mini/IoT-labs/webserver.js
```

<img width="418" alt="image" src="https://user-images.githubusercontent.com/63437430/160828580-7201f53f-e66a-40d3-8682-ca237476b20a.png">

### 2-3. Temperature / Humidity Sensor test on Raspberry PI:

#### 2-3-1. Install package (PI)

Download package from GitHub

```bash
git clone https://github.com/adafruit/Adafruit_python_DHT.git
```

Modify the package installer to recognize current Raspberry Pi 4 as Version 3.

First, open the file

```bash
cd Adafruit_python_DHT

sudo vi Adafruit_DHT/platform_detect.py
```

Add a case of BCM2711 to the `pi_version` function to return 3.

```python
def pi_version():
    …
    elif match.group(1) == 'BCM2835':
        # Pi 3 or Pi 4
        return 3
    elif match.group(1) == 'BCM2837':
        # Pi 3b+
        return 3
    elif match.group(1) == 'BCM2711': # ADD THIS
        # Pi 4b
        return 3                      # and THIS
    else:
        # Something else, not a pi.
        return None

```

Install package

```bash

sudo apt-get update

sudo apt-get install python3-pip

sudo python3 -m pip install --upgrade pip setuptools wheel

sudo apt install -y build-essential python3-dev

sudo pip3 install .
```

# 위에 설치하는 거 약간 시간이 걸림

<details>
<summary>Package Versions (Expand)</summary>

##### PI

|   Package   |   Version   |
| :---------: | :---------: |
| python3-pip | 18.1-5+rpt1 |

##### Python

|  Package   |   Version   |
| :--------: | :---------: |
| setuptools |  40.8.0-1   |
|   wheel    | 18.1-5+rpt1 |

</details>
<br>

If you have error while build package.

```bash
sudo apt install -y build-essential python3-dev

sudo pip3 install .
```

<details>
<summary>Package Versions (Expand)</summary>

##### PI

|     Package     | Version |
| :-------------: | :-----: |
| build-essential |  12.6   |
|   python3-dev   | 3.7.3-1 |

</details>
<br>

#### 2-3-2. TemSensor test (PI)

Move to example directory

```bash
cd ~/Adafruit_python_DHT/examples
```

Modify test code (Change python to python 3)

```bash
sudo vi AdafruitDHT.py
```

```python
#!/usr/bin/python
...

```

=>

```python
#!/usr/bin/python3
...

```

Execute test code

```bash
sudo ./AdafruitDHT.py 11 4
```

<img width="498" alt="image" src="https://user-images.githubusercontent.com/63437430/160829118-04bae048-2cf3-4c3f-8cd9-4b9295b019d0.png">

### 2-4. Sensor Data Capture and Transfer

#### 2-4-1. Sensor Data capture code (PI)

Install dependencies at RPi

```bash
sudo apt-get update

sudo apt-get install python3-numpy

sudo apt-get install mercurial
```

<details>
<summary>Package Versions (Expand)</summary>

##### PI

|    Package    |     Version     |
| :-----------: | :-------------: |
| python3-numpy |   1:1.16.2-1    |
|   mercurial   | 4.8.2-1+deb10u1 |

</details>
<br>

Open Sensor Data Capture code and Change IP Address

```bash
vi ~/SmartX-mini/IoT-labs/RPI_capture.py
```

<img width="472" alt="image" src="https://user-images.githubusercontent.com/63437430/160829267-f2198912-a27d-4ee3-9b44-e5af753aff6d.png">

#### 2-4-2. Sensor Data transfer code (PI)

Open Sensor Data Capture code and Change IP Address

```bash
vi ~/SmartX-mini/IoT-labs/RPI_transfer.py
```

<img width="498" alt="image" src="https://user-images.githubusercontent.com/63437430/160829383-8053b56c-a4ea-42d1-b4d1-220502b7754a.png">

### 2-5. Execute IoT Web service

At the Docker container in NUC (Webserver)

```bash
cd /SmartX-Mini/IoT-labs

nodejs webserver.js
```

At the Laptop (Tower)
Open Web browser and go to `http://<NUC_IP>`

At the Rpi (Sensor Data Capture and Transfer)

```bash
cd ~/SmartX-mini/IoT-labs

chmod +x process.sh

sudo ./process.sh
```

<img width="490" alt="image" src="https://user-images.githubusercontent.com/63437430/161033216-2c5035de-e827-4f05-a095-f912c2772777.png">

---

## 3. Lab Summary

An example-based realization of container-based IoT-Cloud services that can sense and actuate distributed IoT devices (i.e., Boxes).

For the cloud side, the required Web-app server realization is supported by utilizing Node.js programming.
