#!/bin/bash

# 设置并行数量
PARALLEL_JOBS=10
TOTAL_REQUESTS=990000
REQUESTS_PER_JOB=$((TOTAL_REQUESTS / PARALLEL_JOBS))

# 跟踪子进程PID
declare -a PIDS

# 信号处理函数
cleanup() {
  echo -e "\n取消操作中，正在停止所有进程..."
  
  # 终止所有子进程
  for pid in "${PIDS[@]}"; do
    if kill -0 $pid 2>/dev/null; then
      kill $pid 2>/dev/null
    fi
  done
  
  echo "所有进程已停止，脚本已取消"
  exit 1
}

# 捕获信号
trap cleanup SIGINT SIGTERM SIGHUP

make_request() {
  local start=$1
  local end=$2
  
  for ((i=start; i<=end; i++)); do
    # 生成19位随机数
    RANDOM_NUM=$(printf "%05d%05d%05d%04d" $((RANDOM % 100000)) $((RANDOM % 100000)) $((RANDOM % 100000)) $((RANDOM % 10000)))
    
    RANDOM_HEX=$(head -c 20 /dev/urandom | xxd -p | head -c 40)
    
    CID="${RANDOM_NUM}.1.${RANDOM_HEX}"
    
    curl 'https://short-video-core.yeskiss007-917.workers.dev/api/actions/864' \
      -H 'accept: application/json, text/plain, */*' \
      -H 'accept-language: en' \
      -H 'businesstype: 49TK' \
      -H 'cache-control: no-cache' \
      -H "cid: ${CID}" \
      -H 'content-type: application/json' \
      -H 'managesiteid: svc' \
      -H 'origin: http://localhost:4321' \
      -H 'pragma: no-cache' \
      -H 'priority: u=1, i' \
      -H 'referer: http://localhost:4321/' \
      -H 'sec-ch-ua: "Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"' \
      -H 'sec-ch-ua-mobile: ?0' \
      -H 'sec-ch-ua-platform: "macOS"' \
      -H 'sec-fetch-dest: empty' \
      -H 'sec-fetch-mode: cors' \
      -H 'sec-fetch-site: cross-site' \
      -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36' \
      --data-raw '{"action":"like"}' \
      -s > /dev/null
      
    # 每1000个请求输出一次进度
    if [ $((i % 1000)) -eq 0 ]; then
      echo "进程 $start-$end: 已完成 $((i-start+1))/$((end-start+1)) 请求"
    fi
  done
}

echo "开始并行执行 $PARALLEL_JOBS 个进程，每个进程 $REQUESTS_PER_JOB 个请求"
echo "按 Ctrl+C 可随时取消操作"

# 启动并行作业
for ((j=0; j<PARALLEL_JOBS; j++)); do
  start=$((j * REQUESTS_PER_JOB + 1))
  end=$((start + REQUESTS_PER_JOB - 1))
  
  # 最后一个作业可能需要处理剩余的请求
  if [ $j -eq $((PARALLEL_JOBS - 1)) ]; then
    end=$TOTAL_REQUESTS
  fi
  
  # 在后台启动进程
  make_request $start $end &
  PID=$!
  PIDS+=($PID)
  echo "启动进程 $j (PID: $PID): 处理请求 $start 到 $end"
done

# 等待所有后台进程完成
wait
echo "所有 $TOTAL_REQUESTS 个请求已完成"