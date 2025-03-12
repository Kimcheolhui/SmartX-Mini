# Lab#3. IoT Lab

## 0. Objective

<img width="916" alt="image" src="https://user-images.githubusercontent.com/63437430/161034315-b201ae9e-463e-44d3-a02f-4796a90f6ee4.png">

**이번 Lab의 목표는 IoT 센서를 활용하여 데이터를 수집하고, 이를 서버에 전달하는 IoT-Cloud Hub를 구축하는 것입니다.**

### 0-1. Lab Goal

- 라즈베리파이를 이용한 IoT 센서 데이터 수집
- 센서 데이터를 클라우드 서버로 전송
- Node.js 기반의 웹 서버를 통해 실시간 데이터 시각화

이번 Lab에서는 라즈베리파이(Raspberry Pi) 를 사용하여 센서 데이터를 수집하고, 이를 NUC 서버에서 처리하여 시각화하는 과정을 실습합니다.

### 0-2. IoT-Cloud 시스템이 왜 필요한가?

IoT 기기에서 수집되는 데이터는 개별적으로는 의미가 크지 않지만, 이를 클라우드에서 통합 및 분석하면 강력한 정보나 인사이트를 얻을 수 있습니다. 이러한 데이터는 실시간 모니터링, 자동화, 원격 제어 등의 다양한 분야에서 활용됩니다. Tower Lab에서 진행한 모니터링 시스템 구축과 그 필요성이 비슷하며, 이 Lab에서는 IoT를 활용한 모니터링 시스템이라고 볼 수 있습니다.

### 0-3. Node.js

Node.js는 오픈 소스, 크로스 플랫폼을 지원하는 백엔드 JavaScript 런타임 환경으로, V8 엔진에서 실행되며 웹 브라우저 외부에서도 JavaScript 코드를 실행할 수 있습니다. Node.js를 사용하면 개발자가 JavaScript로 명령줄 도구(Command Line Tool)를 작성하거나, 서버 측 스크립트(Server-Side Scripting)를 실행하여 웹 페이지가 사용자에게 전송되기 전에 동적으로 콘텐츠를 생성할 수 있습니다. 결과적으로, Node.js는 "JavaScript everywhere" 패러다임을 실현하여, 서버와 클라이언트에서 각각 다른 언어를 사용할 필요 없이 단일 프로그래밍 언어(JavaScript)로 웹 애플리케이션을 개발할 수 있도록 해줍니다. 이번 Lab에서는 IoT 센서 데이터를 저장하고 간단한 시각화를 위해 Node.js를 사용합니다.

### 0-4. Adafruit_python_DHT

온습도 센서를 손쉽게 사용하기 위해 Adafruit_python_DHT를 사용합니다. Adafruit_python_DHT는 Adafruit에서 제공하는 Python 라이브러리로, DHT11, DHT22, AM2302 등의 온습도 센서를 Raspberry Pi 및 BeagleBone과 같은 SBC(Single Board Computer)에서 쉽게 사용할 수 있도록 지원합니다. 이 라이브러리는 센서 데이터를 읽고 처리하는 기능을 제공하며, 간단한 Python 코드로 온도 및 습도를 측정할 수 있습니다.

## 1. Preparation

<img src="img/pi-gpio.png" alt="pi gpio" width="450">

위 이미지는 라즈베리파이의 **GPIO(General Purpose Input/Output, 범용 입출력) 핀 배치도**를 나타냅니다. GPIO는 라즈베리파이에서 외부 장치와 연결하여 전기 신호를 주고 받을 수 있는 핀입니다. 간단히 말해, 센서, LED, 모터 등 다양한 기기를 연결하여 입력을 받거나 출력을 보낼 수 있는 다목적 핀이라고 볼 수 있습니다.

- 빨간색 핀(3.3V 전원): 이 핀은 3.3V 전원을 출력하며, 저전력 센서 및 기타 주변 장치에 안정적인 전압을 공급하는 데 사용됩니다.
- 노란색 핀(GPIO4): 일반적인 GPIO 핀으로, 다양한 입력 및 출력 역할을 수행할 수 있습니다.
- 검은색 핀(GND): 전자의 흐름이 돌아오는 길(기준점) 역할을 합니다. 센서나 LED를 연결할 때 전원(여기서는 3.3V)과 함께 항상 필요한 핀입니다.

> **이제 위 사진의 빨간색 상자 내부처럼 라즈베리파이에 온습도 센서를 연결해줍니다. 실물 사진은 아래를 참고해주세요!**

<img src="img/pi-sensor.png" alt="pi with sensor" width="450">

<img src="img/pi-sensor-detail.png" alt="pi with sensor" width="450">

---

## 2. Practice

### 2-1. Node.js 웹 서버를 위한 Docker Container 실행 ( in NUC )

#### 2-1-1. Docker Container 실행

아래의 준비된 도커 컨테이너 이미지를 띄워주세요.

(\*연구실에서 수정 작업을 했기 때문에 저 dns가 꼭 필요한지 확인하지 못했으나, 마지막 확인 작업 때 dns 없이도 잘 돌아가는지 확인하고 삭제할 것)

```bash
sudo docker run -it --net host --dns 203.237.32.100 --name webserver cheolhuikim/smartx-box-mini
```

컨테이너 내부에 진입하면 아래 명령어를 실행해주세요.

```bash
apt-get update

apt-get install vim
```

### 2-2. 웹 서버 코드 수정하기 (NUC)

아래 명령어를 입력해 웹 서버 코드를 확인하고, `<NUC IP>`를 여러분의 NUC IP로 수정해주세요.

```bash
vi /SmartX-Mini/IoT-labs/webserver.js
```

<img width="450" alt="image" src="https://user-images.githubusercontent.com/63437430/160828580-7201f53f-e66a-40d3-8682-ca237476b20a.png">

### 2-3. 온습도 센서 테스트 ( in PI )

이제 라즈베리파이에 연결된 온습도 센서가 제대로 동작하는지 확인하겠습니다.

#### 2-3-1. Install package

아래 명령어를 입력해 필요한 파일들을 다운로드 해주세요

```bash
git clone https://github.com/adafruit/Adafruit_python_DHT.git
```

> **Adafruit_python_DHT?** `0-4. Adafruit_python_DHT` 참고

라즈베리파이 버전 4를 3으로 인식할 수 있도록 Adafruit_DHT의 패키지 Installer를 수정해줘야합니다.

> **Why?** 라즈베리파이 4의 SoC(System on Chip)는 BCM2711이지만, 기존 Adafruit_python_DHT 라이브러리는 이를 인식하지 못하고 기본적으로 지원하는 BCM2835, BCM2837 등과 다르게 처리합니다. 따라서, platform_detect.py 파일에서 BCM2711을 Pi 3으로 인식하도록 설정하면 라이브러리가 정상적으로 작동하며, 추가적인 호환성 문제 없이 센서 데이터를 읽을 수 있습니다.

우선, 파일을 열어줍니다

```bash
cd Adafruit_python_DHT

sudo vi Adafruit_DHT/platform_detect.py
```

**BCM2711**에 대한 case를 `pi_version` 함수에 추가해주고, 3을 return하도록 합니다.

```python
def pi_version():
    …
    elif match.group(1) == 'BCM2835':
        # Pi 3 or Pi 4
        return 3
    elif match.group(1) == 'BCM2837':
        # Pi 3b+
        return 3
    elif match.group(1) == 'BCM2711': # 추가
        # Pi 4b
        return 3                      # 추가
    else:
        # Something else, not a pi.
        return None

```

패키지 Installer를 수정했으므로, 이제 필요한 패키지들을 설치해줍니다. 약간 시간이 걸릴 수 있습니다.

```bash

sudo apt-get update

sudo apt-get install python3-pip

sudo python3 -m pip install --upgrade pip setuptools wheel

sudo apt install -y build-essential python3-dev

sudo pip3 install .
```

<details>
<summary>Package Versions (Expand)</summary>

##### PI

|     Package     |   Version   |
| :-------------: | :---------: |
|   python3-pip   | 18.1-5+rpt1 |
| build-essential |    12.6     |
|   python3-dev   |   3.7.3-1   |

##### Python

|  Package   |   Version   |
| :--------: | :---------: |
| setuptools |  40.8.0-1   |
|   wheel    | 18.1-5+rpt1 |

</details>
<br>

#### 2-3-2. 온습도 센서 테스트 ( in PI )

예제 폴더로 이동합니다.

```bash
cd ~/Adafruit_python_DHT/examples
```

테스트 코드를 열고, `python`을 `python3`로 수정합니다

```bash
sudo vi AdafruitDHT.py
```

From

```python
#!/usr/bin/python
...

```

To

```python
#!/usr/bin/python3
...

```

테스트 코드를 실행합니다.

```bash
sudo ./AdafruitDHT.py 11 4
```

아래와 같이 온도와 습도가 잘 표기됐다면, 온습도 센서가 라즈베리파이에 제대로 연결된 것을 의미합니다. 만약 오류가 발생한다면, 아래 순서를 따라주세요.

1. `1. Preparation`으로 돌아가서 온습도 센서의 핀이 올바른 GPIO 핀에 꽂혀있는지 확인해주세요.
2. 아무런 문제를 발견하지 못했다면, 패키지 설치가 제대로 됐는지 확인해주세요. 패키지를 다시 설치해보는 것도 방법이 될 수 있습니다.
3. 센서 자체의 문제일 수 있습니다. 만약 여전히 문제가 해결되지 않았다면, 조교를 호출해주세요.

<img width="450" alt="image" src="https://user-images.githubusercontent.com/63437430/160829118-04bae048-2cf3-4c3f-8cd9-4b9295b019d0.png">

### 2-4. 센서 데이터 수집과 전송 ( in PI )

이번에는 라즈베리파이에서 수집한 센서 데이터를 NUC으로 전달하기 위해, 관련 코드를 수정하겠습니다.

#### 2-4-1. 필요한 패키지 설치

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

#### 2-4-2. 센서 데이터 수집 코드

센서 데이터 수집 코드를 열고, `<NUC IP>`를 여러분의 NUC IP로 수정합니다.

```bash
vi ~/SmartX-mini/IoT-labs/RPI_capture.py
```

<img width="500" alt="image" src="https://user-images.githubusercontent.com/63437430/160829267-f2198912-a27d-4ee3-9b44-e5af753aff6d.png">

#### 2-4-3. 센서 데이터 전송 코드

센서 데이터 전송 코드를 열고, `<NUC IP>`를 여러분의 NUC IP로 수정합니다.

```bash
vi ~/SmartX-mini/IoT-labs/RPI_transfer.py
```

<img width="500" alt="image" src="https://user-images.githubusercontent.com/63437430/160829383-8053b56c-a4ea-42d1-b4d1-220502b7754a.png">

### 2-5. IoT Web Service 실행하기

이제 지금까지 작업한 내용을 바탕으로 간단한 IoT Web Service를 실행하도록 하겠습니다.

#### 2-5-1. Web Server 실행하기 ( in NUC )

NUC에서 실행했던 도커 컨테이너 내부에서 다음의 명령어를 실행해주세요. 다음의 명령어는 `webserver.js`라는 웹서버 코드를 실행합니다.

```bash
cd /SmartX-Mini/IoT-labs

nodejs webserver.js
```

#### 2-5-2. 센서 데이터를 수집하고 전송하기 ( in PI )

다음의 명령어를 실행해주세요. `process.sh`는 아까 수정했던 `RPI_capture.py`와 `RPI_transfer.py` 파일을 순차적으로 실행합니다.

```bash
cd ~/SmartX-mini/IoT-labs

chmod +x process.sh

sudo ./process.sh
```

#### 2-5-3. IoT Web Service 접속하기 ( in NUC )

NUC에서 웹브라우저를 열고 `http://<NUC IP>`에 접속해주세요.

다음과 같은 화면을 확인한다면 성공입니다! 새로고침을 눌러, 온습도 센서 데이터가 지속적으로 바뀌는 것을 확인해보세요.

<img width="490" alt="image" src="https://user-images.githubusercontent.com/63437430/161033216-2c5035de-e827-4f05-a095-f912c2772777.png">

---

## 3. Lab Summary

이 Lab의 목표는 IoT 센서를 활용하여 데이터를 수집하고, 이를 서버에 전달하는 IoT-Cloud Hub를 구축하는 것입니다.
여러분은 라즈베리파이를 활용하여 IoT 센서 데이터를 수집하고, 이를 NUC에 위치한 웹서버로 전송하여 시각화하는 IoT-Cloud 시스템을 구축하는 실습을 진행했습니다.

### (Recall) IoT-Cloud 시스템이 왜 필요한가?

IoT 기기에서 수집된 데이터는 개별적으로는 의미가 크지 않지만, 이를 클라우드에서 통합 및 분석하면 실시간 모니터링, 자동화, 원격 제어 등 다양한 분야에서 강력한 활용이 가능합니다. 이번 Lab에서는 IoT 데이터를 처리하고 웹에서 시각화하여, Tower Lab에서 다뤘던 모니터링 시스템과 유사한 IoT 기반 데이터 모니터링의 개념을 실습했습니다.

### 주요 과정 요약

1. 라즈베리파이 GPIO 핀을 활용하여 온습도 센서 연결 및 테스트
2. 온습도 센서 데이터를 NUC 서버로 전송
3. Node.js 기반의 웹 서버에서 데이터 시각화
