const test = require('node:test');
const assert = require('node:assert/strict');

const { __testables } = require('../scraper');

test('fetchDormitoryData supports both DeviceNo and legacy DevcieNo fields', async () => {
  const mockSession = {
    post: async (url) => {
      if (url === '/Home/GetUserInfo') {
        return {
          data: {
            Data: {
              RealName: '测试用户',
              Mobile: '13800138000',
              GenderStr: '男'
            }
          }
        };
      }

      if (url === '/Home/GetUserBindDevices') {
        return {
          data: {
            Tag: 1,
            Data: {
              RoomName: '13栋513',
              DevicesList: [
                {
                  RoomId: 'room-1',
                  DeviceName: '智能电表',
                  DeviceTypeName: '电表',
                  DeviceNo: 'NEW-DEVICE-NO',
                  DevcieNo: 'LEGACY-DEVICE-NO',
                  DeviceBalance: 66.6,
                  UpdateTime: '2026-01-01T00:00:00.000Z',
                  IsOnline: 1,
                  DevicePrice: 0.5441,
                  RoomInfo: '13栋513'
                }
              ]
            }
          }
        };
      }

      throw new Error(`Unexpected URL: ${url}`);
    }
  };

  const data = await __testables.fetchDormitoryData(mockSession, {
    id: '13-513',
    userName: '测试用户',
    building: '13栋',
    floor: '5楼',
    roomNumber: '513'
  });

  assert.ok(data);
  assert.equal(data.deviceInfo.deviceNo, 'NEW-DEVICE-NO');
});
