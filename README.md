

# AWS Hub-and-Spoke Architecture with Network Firewall

## Purpose

This project build a **centralized security architecture** in AWS - a real-world enterprise pattern used by companies to secure their cloud infrastructure.

### What it covers:

1. **Hub-and-Spoke Network Design** - A scalable architecture where all traffic flows through a central "hub" for inspection
2. **Centralized Security** - How to inspect and control ALL traffic between VPCs and to the internet using AWS Network Firewall
3. **Transit Gateway** - AWS's network transit hub that connects multiple VPCs
4. **Defense in Depth** - Layered security using firewalls, security groups, and network segmentation
5. **Real-world Skills** - This is how enterprises actually secure their AWS environments


## Implementation

### **Step 1: Create the Hub VPC**

- **Name**: `Hub-VPC`
- **IPv4 CIDR**: `10.0.0.0/16`
- **Availability Zones**: 1
- **Public subnets**: 2
- **Private subnets**: 2
- **NAT gateways**: 1 (in 1 AZ)
- **VPC endpoints**: None



**After creation, rename the subnets:**

- One public subnet → `Jump-Server-Subnet` (e.g., 10.0.0.0/24)
- One public subnet → `NAT-Gateway-Subnet` (e.g., 10.0.1.0/24)
- One private subnet → `Firewall-Subnet` (e.g., 10.0.128.0/24)
- Keep one private subnet as spare

---

### **Step 2: Create the Spoke VPC**

- **Name**: `Spoke-VPC`
- **IPv4 CIDR**: `20.0.0.0/16`
- **Availability Zones**: 1
- **Public subnets**: 0
- **Private subnets**: 2
- **NAT gateways**: 0



**After creation, rename the subnets:**

- First private subnet → `VM-01-Subnet` (e.g., 10.1.0.0/24)
- Second private subnet → `VM-02-Subnet` (e.g., 10.1.1.0/24)

---

### **Step 3: Create Transit Gateway**

1. Configure:
    - **Name**: `Hub-Spoke-TGW`
    - **Amazon side ASN**: 64512 
    - **Default route table association**: ✅ Enable
    - **Default route table propagation**: ✅ Enable
    - **DNS support**: ✅ Enable
2. Click **Create Transit Gateway**


---

### **Step 4: Attach VPCs to Transit Gateway**

**Attach Hub VPC:**

1. Go to **Transit Gateway Attachments** → Click **Create Transit Gateway Attachment**
2. Configure:
    - **Name**: `Hub-VPC-Attachment`
    - **Transit Gateway ID**: Select `Hub-Spoke-TGW`
    - **Attachment type**: VPC
    - **VPC ID**: Select `Hub-VPC`
    - **Subnet IDs**: Select the **Firewall-Subnet** (the private subnet)
3. Click **Create Transit Gateway Attachment**

**Attach Spoke VPC:**

1. Click **Create Transit Gateway Attachment** again
2. Configure:
    - **Name**: `Spoke-VPC-Attachment`
    - **Transit Gateway ID**: Select `Hub-Spoke-TGW`
    - **Attachment type**: VPC
    - **VPC ID**: Select `Spoke-VPC`
    - **Subnet IDs**: Select **both** VM subnets (VM-01-Subnet and VM-02-Subnet)
3. Click **Create Transit Gateway Attachment**

---

### **Step 5: Create Security Groups**

- **Jump Server Security Group:**
    - **Name**: `Jump-Server-SG`
    - **Description**: Allow SSH from my IP
    - **VPC**: `Hub-VPC`
    - **Inbound rules**:
        - Type: SSH (22), Source: My IP
    - **Outbound rules**: All traffic (default)
    
- **Firewall EC2 Security Group:**
    - **Name**: `Firewall-SG`
    - **Description**: Allow all traffic for routing
    - **VPC**: `Hub-VPC`
    - **Inbound rules**:
        - Type: All traffic, Source: `10.0.0.0/16` (Hub VPC)
        - Type: All traffic, Source: `20.0.0.0/16` (Spoke VPC)
        - Type: SSH, Source: `10.0.1.0/24` (Jump Server subnet)
    - **Outbound rules**: All traffic
	
- **VM-01 Security Group:**
    - **Name**: `VM-01-SG`
    - **Description**: Allow SSH from Hub, ICMP from Spoke
    - **VPC**: `Spoke-VPC`
    - **Inbound rules**:
        - Type: SSH, Source: `10.0.0.0/16` (Hub VPC)
        - Type: All ICMP-IPv4, Source: `20.0.0.0/16` (Spoke VPC)
    - **Outbound rules**: All traffic
	
- **VM-02 Security Group:**
    - **Name**: `VM-02-SG`
    - **Description**: Allow ICMP only
    - **VPC**: `Spoke-VPC`
    - **Inbound rules**:
        - Type: All ICMP-IPv4, Source: `20.0.0.0/16` (Spoke VPC)
    - **Outbound rules**: All traffic


---

### **Step 6: Launch EC2 Instances**

- **Launch Jump Server:**
    - **Name**: `Jump-Server`
    - **AMI**: Amazon Linux 2023 (Free tier eligible)
    - **Instance type**: t2.micro
    - **Key pair**: Create new or select existing
    - **Network settings**:
        - **VPC**: `Hub-VPC`
        - **Subnet**: `Jump-Server-Subnet`
        - **Auto-assign public IP**: **Enable**
        - **Security group**: `Jump-Server-SG`
	
- **Launch Firewall EC2:**
    - **Name**: `Firewall-EC2`
    - **AMI**: Amazon Linux 2023
    - **Instance type**: t2.micro
    - **Key pair**: Same key
    - **Network settings**:
        - **VPC**: `Hub-VPC`
        - **Subnet**: `Firewall-Subnet`
        - **Auto-assign public IP**: **Disable**
        - **Security group**: `Firewall-SG`
	CRITICAL: Disable Source/Destination Check on Firewall EC2:** **Actions** → **Networking** → **Change source/destination check**
	> This allows the EC2 to route traffic not destined for itself!
	
- **Launch VM-01:**
    - **Name**: `VM-01`
    - **AMI**: Amazon Linux 2023
    - **Instance type**: t2.micro
    - **Key pair**: Same key
    - **Network settings**:
        - **VPC**: `Spoke-VPC`
        - **Subnet**: `VM-01-Subnet`
        - **Auto-assign public IP**: **Disable**
        - **Security group**: `VM-01-SG`
	
- **Launch VM-02:**
    - **Name**: `VM-02`
    - **AMI**: Amazon Linux 2023
    - **Instance type**: t2.micro
    - **Key pair**: Same key
    - **Network settings**:
        - **VPC**: `Spoke-VPC`
        - **Subnet**: `VM-02-Subnet`
        - **Auto-assign public IP**: **Disable**
        - **Security group**: `VM-02-SG`


---


### **Step 7: Configure Route Tables**

**A) Create and Configure Jump Server Route Table:**

1. Go to **Route Tables** → **Create route table**
    - **Name**: `Jump-Server-RT`
    - **VPC**: `Hub-VPC`
2. Click **Create**
3. Select the route table → **Routes** → **Edit routes**:
    - Route 1: `0.0.0.0/0` → Internet Gateway (`Hub-IGW`)
    - Route 2: `20.0.0.0/16` → Firewall-EC2 eni
4. **Save changes**
5. Go to **Subnet associations** → **Edit subnet associations**
    - Select `Jump-Server-Subnet`
6. **Save**

**B) Create and Configure Firewall Route Table:**

1. **Create route table**:
    - **Name**: `Firewall-RT`
    - **VPC**: `Hub-VPC`
2. Select it → **Edit routes**:
    - Route 1: `0.0.0.0/0` → NAT Gateway (if you created one)
    - Route 2: `20.0.0.0/16` → Transit Gateway
3. **Save changes**
4. **Subnet associations** → Associate with `Firewall-Subnet`

**C) Create and Configure NAT Route Table:**

1. **Create route table**:
    - **Name**: `NAT-RT`
    - **VPC**: `Hub-VPC`
2. Select it → **Edit routes**:
    - Route 1: `0.0.0.0/0` → Internet Gateway
    - Route 2: `0.0.0.0/16` → ENI of Firewall-EC2 
3. **Save changes**
4. **Subnet associations** → Associate with `NAT-Subnet`



**D) Configure Transit Gateway Route Table:**

1. Go to **Transit Gateway Route Tables**
2. Select the default route table
3. **Routes** → **Create static route**:
    - **CIDR**: `0.0.0.0/0`
    - **Attachment**: `Hub-Attachment`
4. **Create route**

**E) Configure Spoke VPC Route Tables:**

For **VM-01-Subnet**:

1. Find its route table
2. **Edit routes**:
    - Route: `0.0.0.0/0` → Transit Gateway


For **VM-02-Subnet**:

1. Find its route table (or create new `VM-02-RT`)
2. **Edit routes**:
    - Route: `0.0.0.0/0` → Transit Gateway


---

### **Step 10: Configure the Firewall EC2**

**SSH into Jump Server first:**

Then run this 
```bash
# 1. Make sure dnf-plugins-core is installed (for 'dnf download')
sudo dnf install dnf-plugins-core -y

# 2. Download the nftables package (and its dependencies)
mkdir ~/nftables_rpms
cd ~/nftables_rpms
sudo dnf download --resolve nftables

# 3. Compress the RPM files for easy transfer
tar -czvf nftables_rpms.tar.gz *.rpm
mv nftables_rpms.tar.gz ~/
cd ~

# Copy the files to the Firewall EC2
scp -i kp.pem nftables_rpms.tar.gz ec2-user@10.0.155.127:/home/ec2-user/
```


**Copy your SSH key to Jump Server:**

**From Jump Server, SSH to Firewall EC2:**

Add This rule to the Firewall-SG
- **Type:** SSH
- **Port:** 22
- **Source:** `10.0.0.0/16` (Hub VPC CIDR)

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<firewall-ec2-private-ip>

cd /home/ec2-user
tar -xzvf nftables_rpms.tar.gz
sudo rpm -ivh *.rpm
nft --version

```

**Configure the Firewall (run these commands on Firewall-EC2):**

```bash
# ======================================
# Enable IP forwarding
# ======================================
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf

# ======================================
# Enable and start nftables
# ======================================
sudo systemctl enable --now nftables

# ======================================
# Configure nftables ruleset
# ======================================
# Create a new nftables config with ICMP allowed
sudo tee /etc/nftables.conf > /dev/null <<'EOF'
#!/usr/sbin/nft -f

flush ruleset

table ip nat {
    chain prerouting {
        type nat hook prerouting priority 0;
    }

    chain postrouting {
        type nat hook postrouting priority 100;
        oifname "ens5" masquerade
    }
}

table inet filter {
    chain input {
        type filter hook input priority 0;
        policy accept;
    }

    chain forward {
        type filter hook forward priority 0;
        policy drop;

        ct state established,related accept;

        # Allow ICMP from Hub to Spoke VMs (for testing)
        ip saddr 10.0.0.0/16 ip daddr 20.0.0.0/16 icmp type echo-request accept;
        
        # VM-01 to VM-02 ICMP
        ip saddr 20.0.128.0/20 ip daddr 20.0.144.0/20 icmp type echo-request accept;
        ip saddr 20.0.144.0/20 ip daddr 20.0.128.0/20 icmp type echo-request drop;

        # SSH rules
        ip saddr 20.0.144.0/20 ip daddr 20.0.128.0/20 tcp dport 22 accept;
        ip saddr 20.0.128.0/20 ip daddr 20.0.144.0/20 tcp dport 22 drop;
        ip saddr 10.0.0.0/16 ip daddr 20.0.128.0/20 tcp dport 22 accept;
        ip saddr 10.0.0.0/16 ip daddr 20.0.144.0/20 tcp dport 22 drop;

        # Allow outbound to internet
        ip daddr 0.0.0.0/0 accept;
    }

    chain output {
        type filter hook output priority 0;
        policy accept;
    }
}
EOF



# ======================================
# Apply nftables configuration
# ======================================
sudo nft -f /etc/nftables.conf

# ======================================
# Verify applied rules
# ======================================
sudo nft list ruleset


```

---

### **Step 11: Test Connectivity**


**Run from Jump Server**

```bash
#!/bin/bash
echo "=================================="
echo "HUB-AND-SPOKE NETWORK TESTS"
echo "Testing from: Jump Server"
echo "=================================="
echo ""

echo "=== 1. INTERNET CONNECTIVITY TEST ==="
ping -c 3 8.8.8.8
echo ""

echo "=== 2. FIREWALL REACHABILITY TEST ==="
ping -c 3 10.0.155.127
echo ""

echo "=== 3. VM-01 CONNECTIVITY TEST (via Firewall & TGW) ==="
ping -c 3 20.0.143.94
echo ""

echo "=== 4. VM-02 CONNECTIVITY TEST (via Firewall & TGW) ==="
ping -c 3 20.0.149.206
echo ""

echo "=== 5. TRACEROUTE TO VM-01 (Show network path) ==="
traceroute -n -m 5 20.0.143.94
echo ""

echo "=== 6. TRACEROUTE TO VM-02 (Show network path) ==="
traceroute -n -m 5 20.0.149.206
echo ""

echo "=== 7. SSH TO VM-01 TEST (Port 22 check) ==="
timeout 3 bash -c "echo > /dev/tcp/20.0.143.94/22" && echo "VM-01 SSH port 22 is OPEN" || echo "VM-01 SSH port 22 is CLOSED/BLOCKED (Expected per firewall rules)"
echo ""

echo "=== 8. ROUTE TABLE VERIFICATION ==="
echo "Routes from Jump Server:"
ip route show
echo ""

echo "=================================="
echo "Jump Server Tests Complete"
echo "=================================="
```


**Run from Firewall EC2**

```bash
#!/bin/bash
echo "=================================="
echo "FIREWALL EC2 TESTS"
echo "Testing from: Firewall EC2"
echo "=================================="
echo ""

echo "=== 1. IP FORWARDING STATUS ==="
echo -n "IP Forwarding enabled: "
cat /proc/sys/net/ipv4/ip_forward
echo "(Should be: 1)"
echo ""

echo "=== 2. NFTABLES SERVICE STATUS ==="
sudo systemctl status nftables --no-pager
echo ""

echo "=== 3. ACTIVE FIREWALL RULES ==="
sudo nft list ruleset
echo ""

echo "=== 4. NETWORK INTERFACES ==="
ip addr show
echo ""

echo "=== 5. ROUTING TABLE ==="
ip route show
echo ""

echo "=== 6. SOURCE/DESTINATION CHECK STATUS ==="
echo "Verify this is DISABLED in AWS Console:"
echo "EC2 -> Network Interfaces -> Select Firewall ENI -> Actions -> Change source/dest check"
echo ""

echo "=== 7. CONNECTIVITY TO VM-01 ==="
ping -c 3 20.0.143.94
echo ""

echo "=== 8. CONNECTIVITY TO VM-02 ==="
ping -c 3 20.0.149.206
echo ""

echo "=== 9. INTERNET CONNECTIVITY ==="
ping -c 3 8.8.8.8
echo ""

echo "=================================="
echo "Firewall EC2 Tests Complete"
echo "=================================="
```


**Run from VM-01**

```bash
#!/bin/bash
echo "=================================="
echo "VM-01 TESTS (Spoke VPC)"
echo "Testing from: VM-01"
echo "=================================="
echo ""

echo "=== 1. INTERNET CONNECTIVITY TEST ==="
ping -c 3 8.8.8.8
echo ""

echo "=== 2. PING VM-02 TEST (Intra-Spoke Communication) ==="
ping -c 3 20.0.149.206
echo "(Should SUCCEED - VM-01 can ping VM-02 per firewall rules)"
echo ""

echo "=== 3. PING FIREWALL TEST ==="
ping -c 3 10.0.155.127
echo ""

echo "=== 4. PING JUMP SERVER TEST ==="
ping -c 3 10.0.24.27
echo ""

echo "=== 5. SSH TO VM-02 TEST ==="
timeout 3 bash -c "echo > /dev/tcp/20.0.149.206/22" && echo "VM-02 SSH port 22 is OPEN (Expected - VM-02 allows SSH from VM-01)" || echo "VM-02 SSH port 22 is CLOSED/BLOCKED"
echo ""

echo "=== 6. ROUTE TABLE VERIFICATION ==="
echo "Default route should point to Transit Gateway:"
ip route show
echo ""

echo "=== 7. DNS RESOLUTION TEST ==="
nslookup google.com
echo ""

echo "=================================="
echo "VM-01 Tests Complete"
echo "=================================="
```

---

## Expected Results Summary

**✅ Jump Server should:**

- Reach internet (8.8.8.8)
- Reach Firewall directly
- Reach both VMs via Firewall → TGW
- SSH to VM-01 (allowed by firewall)
- SSH to VM-02 blocked by firewall

**✅ Firewall EC2 should:**

- Have IP forwarding enabled (value = 1)
- Have nftables running with custom rules
- Forward traffic between Hub and Spoke VPCs
- Enforce security policies (SSH/ICMP rules)

**✅ VM-01 should:**

- Reach internet via NAT Gateway
- Ping VM-02 (allowed)
- SSH to VM-02 blocked by firewall
- Accept SSH from Jump Server

**✅ VM-02 should:**

- Reach internet via NAT Gateway
- Cannot ping VM-01 (blocked by firewall)
- Can SSH to VM-01 (allowed)
- Cannot accept SSH from Jump Server (blocked)
---

## Free Tier Cost Breakdown

- **Transit Gateway**: ~$0.05/hour = **~$36/month** ⚠️ (NOT free tier)
- **NAT Gateway**: ~$0.045/hour = **~$32/month** ⚠️ (NOT free tier)
- **EC2 instances (4 × t2.micro)**: **FREE** for 750 hours/month
- **Elastic IP**: **FREE** if attached to running instance

**Total: ~$70/month** (much better than $300+ with Network Firewall!)

**To minimize costs:**

- Delete NAT Gateway if you don't need internet access from Spoke VMs
- Delete Transit Gateway when not testing (you'll have to recreate routes)
- Stop all instances when not in use

---
