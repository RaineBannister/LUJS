const PathType = {
    'MOVEMENT': 0,
    'MOVING_PLATFORM': 1,
    'PROPERTY': 2,
    'CAMERA': 3,
    'SPAWNER': 4,
    'SHOWCASE': 5,
    'RACE': 6,
    'RAIL': 7
};

const PathBehavior = {
    'LOOP': 1,
    'BOUNCE': 2,
    'ONCE': 3
};

/**
 * Opens LUZ files
 */
class LUZ {
    /**
     *
     * @param {BitStream} stream
     */
    constructor(stream) {
        this.version = stream.readLong();
        if(this.version >= 0x24) {
            this.unknown1 = stream.readLong();
        }
        this.zoneID = stream.readLong();
        if(this.version >= 0x26) {
            this.spawnX = stream.readFloat();
            this.spawnY = stream.readFloat();
            this.spawnZ = stream.readFloat();
            this.spawnrX = stream.readFloat();
            this.spawnrY = stream.readFloat();
            this.spawnrZ = stream.readFloat();
            this.spawnrW = stream.readFloat();
        }

        let sceneCount = 0;
        if(this.version < 0x25) {
            sceneCount = stream.readByte();
        } else {
            sceneCount = stream.readLong();
        }

        this.scenes = [];
        for(let i = 0; i < sceneCount; i ++) {
            let filename = stream.readString(stream.readByte());
            let id = stream.readByte();
            stream.readString(3);
            let isAudioScene = stream.readByte();
            stream.readString(3);
            let sceneName = stream.readString(stream.readByte());
            stream.readString(3);

            this.scenes.push({
                filename: filename,
                id: id,
                isAudioScene: isAudioScene,
                sceneName: sceneName
            });
        }

        let unknown2 = stream.readByte();
        let mapFileName = stream.readString(stream.readByte());
        let mapName = stream.readString(stream.readByte());
        let mapDesc = stream.readString(stream.readByte());

        if(this.version >= 0x20) {
            let countOfSceneTransitions = stream.readLong();
            this.sceneTransitions = [];
            for(let i = 0; i < countOfSceneTransitions; i ++) {
                let sceneTransitionName = "";
                if(this.version < 0x25) {
                    sceneTransitionName = stream.readString(stream.readByte());
                }

                let loopTimes = 5;
                if(this.version <= 0x21 || this.version >= 0x27) {
                    loopTimes = 2;
                }

                let sceneTransition = {
                    name: sceneTransitionName,
                    transitionPoints: []
                };

                for(let j = 0; j < loopTimes; j ++) {
                    sceneTransition.transitionPoints.push({
                        sceneId: stream.readLongLong(),
                        x: stream.readFloat(),
                        y: stream.readFloat(),
                        z: stream.readFloat()
                    });
                }
            }
        }

        if(this.version >= 0x23) {
            this.paths = [];

            stream.readLong();
            stream.readLong();
            let pathsCount = stream.readLong();
            for(let i = 0; i < pathsCount; i ++) {
                let path = {};
                path.version = stream.readLong();
                path.name = "";
                let pathNameLength = stream.readByte();
                for(let j = 0; j < pathNameLength; j ++) {
                    path.name += String.fromCharCode(stream.readShort());
                }
                path.type = stream.readLong();
                stream.readLong();
                path.behavior = stream.readLong();

                switch(path.type) {
                    case PathType.MOVING_PLATFORM:
                        if(path.version >= 18) {
                            stream.readByte();
                        } else if (path.version >= 13) {
                            let temp = stream.readByte();
                            for(let k = 0; k < temp; k ++) {
                                stream.readShort();
                            }
                        }
                        break;
                    case PathType.PROPERTY:
                        stream.readLong();
                        stream.readLong();
                        stream.readLong();
                        stream.readLongLong();
                        let temp2 = stream.readByte();
                        for(let j = 0; j < temp2; j ++) {
                            stream.readShort();
                        }
                        let temp3 = stream.readLong();
                        for(let j = 0; j < temp3; j ++) {
                            stream.readShort();
                        }
                        stream.readLong();
                        stream.readLong();
                        stream.readFloat();
                        stream.readLong();
                        stream.readLong();
                        stream.readFloat();
                        stream.readFloat();
                        stream.readFloat();
                        stream.readFloat();
                        break;
                    case PathType.CAMERA:
                        let temp4 = stream.readByte();
                        for(let j = 0; j < temp4; j ++) {
                            stream.readShort();
                        }
                        if(path.version >= 14) stream.readByte();
                        break;
                    case PathType.SPAWNER:
                        let spawnedLOT = stream.readLong();
                        let respawnTime = stream.readLong();
                        let max = stream.readLong();
                        let min = stream.readLong();
                        let spawnerID = stream.readLongLong();
                        let activateOnLoad = stream.readBoolean();
                        break;
                }
                path.waypoints = [];
                let waypointCount = stream.readLong();
                for(let j = 0; j < waypointCount; j ++) {
                    let waypoint = {};
                    waypoint.x = stream.readFloat();
                    waypoint.y = stream.readFloat();
                    waypoint.z = stream.readFloat();
                    switch(path.type) {
                        case PathType.MOVING_PLATFORM:
                            waypoint.w = stream.readFloat();
                            waypoint.x = stream.readFloat();
                            waypoint.y = stream.readFloat();
                            waypoint.z = stream.readFloat();
                            waypoint.lock = stream.readBoolean();
                            waypoint.movementSpeed = stream.readFloat();
                            waypoint.waitTime = stream.readFloat();
                            if(path.version >= 13) {
                                let waypointArriveLength = stream.readByte();
                                waypoint.arrive = "";
                                for(let k = 0; k < waypointArriveLength; k ++) {
                                    waypoint.arrive += String.fromCharCode(stream.readShort());
                                }
                                let waypointDepartLength = stream.readByte();
                                waypoint.depart = "";
                                for(let k = 0; k < waypointArriveLength; k ++) {
                                    waypoint.depart += String.fromCharCode(stream.readShort());
                                }
                            }
                            break;
                        case PathType.CAMERA:
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            break;
                        case PathType.SPAWNER:
                            waypoint.w = stream.readFloat();
                            waypoint.x = stream.readFloat();
                            waypoint.y = stream.readFloat();
                            waypoint.z = stream.readFloat();
                            break;
                        case PathType.RACE:
                            waypoint.w = stream.readFloat();
                            waypoint.x = stream.readFloat();
                            waypoint.y = stream.readFloat();
                            waypoint.z = stream.readFloat();
                            stream.readByte();
                            stream.readByte();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            break;
                        case PathType.RAIL:
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            stream.readFloat();
                            if(path.version >= 17) stream.readFloat();
                            break;
                    }

                    if(path.type === PathType.MOVEMENT || path.type === PathType.SPAWNER || path.type === PathType.RAIL) {
                        waypoint.config = [];
                        let configCount = stream.readLong();
                        for(let k = 0; k < configCount; k ++) {
                            let item = {
                                name: stream.readWString(stream.readByte()),
                                value: stream.readWString(stream.readByte())
                            };
                            waypoint.config.push(item);
                        }
                    }
                    path.waypoints.push(waypoint);
                }
                this.paths.push(path);
            }
        }
    }
}

module.exports = LUZ;