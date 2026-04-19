(() => {
    const BOOST_HIT_SCALES = [1, 0.7, 0.65, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.1];
    const AURA_BASES = {
        1: 6,
        2: 8,
        3: 12,
        4: 14,
        5: 16,
    };

    function floorValue(value) {
        return Math.floor(Number.isFinite(value) ? value : 0);
    }

    function getHitScale(hitIndex) {
        if (hitIndex <= 1) {
            return BOOST_HIT_SCALES[0];
        }
        return BOOST_HIT_SCALES[Math.min(hitIndex, 10) - 1];
    }

    function getBoostCharacterScale(attackerType) {
        return attackerType === "raoh" ? 1.95 : 1;
    }

    function getAuraCharacterScale(attackerType) {
        if (attackerType === "heart") return 1.2;
        if (attackerType === "raoh") return 1.95;
        return 1;
    }

    function getHitGuardScale(isGuard, isLowHealth) {
        if (isGuard) return 1 / 3;
        if (isLowHealth) return 2 / 3;
        return 1 / 2;
    }

    function calculateBoostRecovery(rowData, settings) {
        const hitGuardScale = getHitGuardScale(rowData.guard, rowData.lowHealth);
        const hitScale = getHitScale(rowData.hits);

        const selfBoostBase = calculateBoostBase(rowData, settings, false);
        const opponentBoostBase = calculateBoostBase(rowData, settings, true);

        const selfBoost = rowData.auraDrain ? 0 : floorValue(selfBoostBase * hitScale);
        const opponentBoost = floorValue(
            Math.min(selfBoost, floorValue(opponentBoostBase)) * hitGuardScale,
        );

        return {
            selfBoost,
            opponentBoost,
        };
    }

    function calculateBoostBase(rowData, settings, isOpponent) {
        const boostCharacterScale = getBoostCharacterScale(
            isOpponent ? settings.defenderType : settings.attackerType,
        );

        let boostAttackSelfBase = floorValue(rowData.level * 2 * boostCharacterScale);
        boostAttackSelfBase = floorValue(boostAttackSelfBase * settings.roundScale);
        if (rowData.projectile && !isOpponent) {
            boostAttackSelfBase *= 3;
            if (boostAttackSelfBase < 0) {
                boostAttackSelfBase += 3;
            }
            boostAttackSelfBase >>= 2;
            if (boostAttackSelfBase == 0) {
                boostAttackSelfBase = 1;
            }
        }
        if (rowData.bani || (rowData.wall && rowData.hits > 1)) {
            boostAttackSelfBase <<= 2;
            if (boostAttackSelfBase < 0x25) {
                boostAttackSelfBase = 0x25;
            }
        } else if (rowData.counterBani) {
            boostAttackSelfBase *= 3;
            if (boostAttackSelfBase < 0x25) {
                boostAttackSelfBase = 0x25;
            }
        }
        if (rowData.wall && !isOpponent) {
            boostAttackSelfBase = floorValue(boostAttackSelfBase / 2);
        }

        if (!isOpponent) {
            boostAttackSelfBase += rowData.accumulation;
        }

        if (!rowData.projectile && rowData.grave && !isOpponent) {
            if (boostAttackSelfBase < 0) {
                boostAttackSelfBase += 3;
            }
            boostAttackSelfBase >>= 2;
        }
        if (boostAttackSelfBase < 1) {
            boostAttackSelfBase = 1;
        }

        return boostAttackSelfBase;
    }

    function calculateAuraRecovery(rowData, settings) {
        const hitGuardScale = getHitGuardScale(rowData.guard, rowData.lowHealth);
        const hitScale = getHitScale(rowData.hits);

        let auraSelfBase = calculateAuraBase(rowData, settings, false);
        let opponentAuraBase = calculateAuraBase(rowData, settings, true);

        const selfAura = Number.parseFloat(Number(auraSelfBase * hitScale).toPrecision(8));
        const opponentAura = Number.parseFloat(
            Number(Math.min(selfAura, opponentAuraBase) * hitGuardScale).toPrecision(8),
        );
        return {
            selfAura,
            opponentAura,
        };
    }

    function calculateAuraBase(rowData, settings, isOpponent) {
        const auraCharacterScale = getAuraCharacterScale(
            isOpponent ? settings.defenderType : settings.attackerType,
        );
        const projectileScale = rowData.projectile && !isOpponent ? 0.75 : 1;

        const auraDrainScale = rowData.auraDrain ? 0.5 : 1;
        const auraWallScale = rowData.wall ? 0.5 : 1;
        const auraGraveScale = rowData.grave ? 1 / 3 : 1;

        let auraSelfBase =
            AURA_BASES[rowData.level] * auraCharacterScale * settings.roundScale * projectileScale;
        if (projectileScale && auraSelfBase == 0.0) {
            auraSelfBase = 1.0;
        }
        if (!isOpponent) {
            auraSelfBase += rowData.accumulation;
            auraSelfBase *= auraDrainScale;
            if (!rowData.projectile) {
                auraSelfBase *= auraGraveScale;
            }
        }
        return (auraSelfBase *= auraWallScale);
    }

    window.calculateGaugeRow = function calculateGaugeRow(rowData, settings) {
        return {
            ...calculateBoostRecovery(rowData, settings),
            ...calculateAuraRecovery(rowData, settings),
        };
    };
})();
