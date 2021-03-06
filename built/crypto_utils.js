"use strict";
/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function bufferToString(buffer) {
    var state = [];
    for (var i = 0; i < buffer.byteLength; i += 1) {
        var index = (buffer[i] % CHARSET.length) | 0;
        state.push(CHARSET[index]);
    }
    return state.join('');
}
exports.bufferToString = bufferToString;
var DEFAULT_SIZE = 1; /** size in bytes */
var HAS_CRYPTO = typeof window !== 'undefined' && !!window.crypto;
exports.cryptoGenerateRandom = function (sizeInBytes) {
    if (sizeInBytes === void 0) { sizeInBytes = DEFAULT_SIZE; }
    var buffer = new Uint8Array(sizeInBytes);
    if (HAS_CRYPTO) {
        window.crypto.getRandomValues(buffer);
    }
    else {
        // fall back to Math.random() if nothing else is available
        for (var i = 0; i < sizeInBytes; i += 1) {
            buffer[i] = Math.random();
        }
    }
    return bufferToString(buffer);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvX3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NyeXB0b191dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7OztHQVlHOztBQUVILElBQU0sT0FBTyxHQUFHLGdFQUFnRSxDQUFDO0FBRWpGLHdCQUErQixNQUFrQjtJQUMvQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzdDLElBQUksS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUM1QjtJQUNELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixDQUFDO0FBUEQsd0NBT0M7QUFJRCxJQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxvQkFBb0I7QUFDNUMsSUFBTSxVQUFVLEdBQUcsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBRSxNQUFNLENBQUMsTUFBYyxDQUFDO0FBRWhFLFFBQUEsb0JBQW9CLEdBQW9CLFVBQUMsV0FBMEI7SUFBMUIsNEJBQUEsRUFBQSwwQkFBMEI7SUFDOUUsSUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDM0MsSUFBSSxVQUFVLEVBQUU7UUFDZCxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2QztTQUFNO1FBQ0wsMERBQTBEO1FBQzFELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQzNCO0tBQ0Y7SUFDRCxPQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMTcgR29vZ2xlIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdFxuICogaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZVxuICogTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXJcbiAqIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuY29uc3QgQ0hBUlNFVCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUb1N0cmluZyhidWZmZXI6IFVpbnQ4QXJyYXkpIHtcbiAgbGV0IHN0YXRlID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnVmZmVyLmJ5dGVMZW5ndGg7IGkgKz0gMSkge1xuICAgIGxldCBpbmRleCA9IChidWZmZXJbaV0gJSBDSEFSU0VULmxlbmd0aCkgfCAwO1xuICAgIHN0YXRlLnB1c2goQ0hBUlNFVFtpbmRleF0pO1xuICB9XG4gIHJldHVybiBzdGF0ZS5qb2luKCcnKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSYW5kb21HZW5lcmF0b3IgeyAoc2l6ZUluQnl0ZXM/OiBudW1iZXIpOiBzdHJpbmc7IH1cblxuY29uc3QgREVGQVVMVF9TSVpFID0gMTsgLyoqIHNpemUgaW4gYnl0ZXMgKi9cbmNvbnN0IEhBU19DUllQVE8gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAhISh3aW5kb3cuY3J5cHRvIGFzIGFueSk7XG5cbmV4cG9ydCBjb25zdCBjcnlwdG9HZW5lcmF0ZVJhbmRvbTogUmFuZG9tR2VuZXJhdG9yID0gKHNpemVJbkJ5dGVzID0gREVGQVVMVF9TSVpFKSA9PiB7XG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHNpemVJbkJ5dGVzKTtcbiAgaWYgKEhBU19DUllQVE8pIHtcbiAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWZmZXIpO1xuICB9IGVsc2Uge1xuICAgIC8vIGZhbGwgYmFjayB0byBNYXRoLnJhbmRvbSgpIGlmIG5vdGhpbmcgZWxzZSBpcyBhdmFpbGFibGVcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemVJbkJ5dGVzOyBpICs9IDEpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IE1hdGgucmFuZG9tKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBidWZmZXJUb1N0cmluZyhidWZmZXIpO1xufTtcbiJdfQ==