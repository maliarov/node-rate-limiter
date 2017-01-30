local totalKey = "ratelimiter." .. KEYS[1] .. ".total"
local limitKey = "ratelimiter." .. KEYS[1] .. ".limit"

redis.call("setnx", limitKey, KEYS[2])
if (redis.call("setnx", totalKey, 0) == 1) then
    redis.call("pexpire", totalKey, KEYS[3])
    redis.call("pexpire", limitKey, KEYS[3])
end

local total = redis.call("incr", totalKey)
local limit = tonumber(redis.call("get", limitKey))
local remain = 0

if total <= limit then 
    remain = (limit - total) + 1
end

return {limit, remain, redis.call("pttl", totalKey)}