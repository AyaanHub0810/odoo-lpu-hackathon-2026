'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  RefreshCw,
  Sparkles,
  Radio,
  CheckCircle2,
  ArrowDownLeft,
  Package,
  Layers,
  Zap,
} from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { motion, AnimatePresence } from 'motion/react';

interface SelectedBayInfo {
  bayName: string;
  sku: string;
  productName: string;
  qty: number;
  capacity: number;
  status: 'Optimal' | 'Low' | 'Empty';
  zone: string;
  isRecentlyReceived?: boolean;
  recentRef?: string;
}

interface ThreeWarehouseViewerProps {
  fullHeight?: boolean;
  className?: string;
}

export function ThreeWarehouseViewer({ fullHeight = false, className = '' }: ThreeWarehouseViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { products, operations, warehouses, locations, createOperation, transitionOperationStatus } = useInventory();

  // Find most recent completed receipt for live 3D inbound telemetry
  const latestDoneReceipt = useMemo(() => {
    return operations
      .filter((op) => op.operationType === 'RECEIPT' && op.status === 'Done')
      .slice(-1)[0] || null;
  }, [operations]);

  const [selectedBay, setSelectedBay] = useState<SelectedBayInfo | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraView, setCameraView] = useState<'iso' | 'top' | 'aisle' | 'dock'>('iso');
  const [showInboundBanner, setShowInboundBanner] = useState(false);
  const [inboundToast, setInboundToast] = useState<{ title: string; desc: string } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const boxesGroupRef = useRef<THREE.Group | null>(null);
  const agvRef = useRef<THREE.Group | null>(null);
  const beaconMeshRef = useRef<THREE.Mesh | null>(null);

  // Trigger banner when new receipt comes in
  useEffect(() => {
    if (latestDoneReceipt) {
      const firstItem = latestDoneReceipt.items[0];
      setInboundToast({
        title: `Inbound Pallet Placed (${latestDoneReceipt.reference})`,
        desc: `${firstItem ? firstItem.name : 'Stock Goods'} (+${firstItem?.quantityDone || 20} units) assigned to Rack A1 - Bay 01`,
      });
      setShowInboundBanner(true);
      const timer = setTimeout(() => setShowInboundBanner(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [latestDoneReceipt]);

  // Initial selection
  useEffect(() => {
    if (!selectedBay && products.length > 0) {
      const p = products[0];
      setSelectedBay({
        bayName: 'Rack A1 - Bay 01',
        sku: p.sku,
        productName: p.name,
        qty: p.onHand,
        capacity: 100,
        status: p.freeToUse <= p.minReorderThreshold ? 'Low' : 'Optimal',
        zone: 'WH/Stock/Aisle 1',
        isRecentlyReceived: !!latestDoneReceipt,
        recentRef: latestDoneReceipt?.reference || 'WH/IN/0001',
      });
    }
  }, [products, latestDoneReceipt, selectedBay]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = fullHeight ? (container.clientHeight || 700) : 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d); // Deep futuristic dark obsidian
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.014);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(24, 20, 28);
    camera.lookAt(0, 3, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xe0e7ff, 1.9);
    mainLight.position.set(16, 26, 16);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x6366f1, 2.5, 45);
    blueLight.position.set(-12, 10, -6);
    scene.add(blueLight);

    const tealLight = new THREE.PointLight(0x10b981, 2.2, 45);
    tealLight.position.set(12, 10, 12);
    scene.add(tealLight);

    // 5. Polished Industrial Concrete Floor
    const floorGeo = new THREE.PlaneGeometry(70, 70);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.35,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor Grid & Guided Navigation Lines
    const gridHelper = new THREE.GridHelper(70, 35, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Safety Aisle Strip
    const stripGeo = new THREE.PlaneGeometry(1.6, 44);
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, opacity: 0.5, transparent: true });
    const safetyStrip1 = new THREE.Mesh(stripGeo, stripMat);
    safetyStrip1.rotation.x = -Math.PI / 2;
    safetyStrip1.position.set(0, 0.03, 0);
    scene.add(safetyStrip1);

    // Inbound Staging Zone Graphic (Receiving Pad)
    const stagingGeo = new THREE.PlaneGeometry(8, 6);
    const stagingMat = new THREE.MeshBasicMaterial({ color: 0x10b981, opacity: 0.25, transparent: true, side: THREE.DoubleSide });
    const stagingPad = new THREE.Mesh(stagingGeo, stagingMat);
    stagingPad.rotation.x = -Math.PI / 2;
    stagingPad.position.set(0, 0.04, -18);
    scene.add(stagingPad);

    // 6. Pallet Racks Construction
    const racksGroup = new THREE.Group();
    const boxesGroup = new THREE.Group();
    boxesGroupRef.current = boxesGroup;

    const rackSteelMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.8, roughness: 0.2 });
    const beamOrangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.5, roughness: 0.4 });
    const palletWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });

    const createRackRow = (xOffset: number, isWest: boolean) => {
      const numBays = 4;
      const bayWidth = 5;
      const levels = 3;
      const levelHeight = 3.2;

      for (let b = 0; b < numBays; b++) {
        const z = (b - (numBays - 1) / 2) * bayWidth;

        // Uprights
        [-1.2, 1.2].forEach((xRel) => {
          const colGeo = new THREE.BoxGeometry(0.15, levels * levelHeight + 1, 0.15);
          const colMesh = new THREE.Mesh(colGeo, rackSteelMat);
          colMesh.position.set(xOffset + xRel, (levels * levelHeight + 1) / 2, z);
          colMesh.castShadow = true;
          racksGroup.add(colMesh);
        });

        // Shelf levels & pallets
        for (let l = 1; l <= levels; l++) {
          const y = l * levelHeight - 0.4;

          // Crossbeams
          const beamGeo = new THREE.BoxGeometry(2.5, 0.15, 0.15);
          const beamFront = new THREE.Mesh(beamGeo, beamOrangeMat);
          beamFront.position.set(xOffset, y, z + 2.4);
          racksGroup.add(beamFront);

          const beamBack = new THREE.Mesh(beamGeo, beamOrangeMat);
          beamBack.position.set(xOffset, y, z - 2.4);
          racksGroup.add(beamBack);

          // Pallet
          const palletGeo = new THREE.BoxGeometry(2.2, 0.2, 4.4);
          const pallet = new THREE.Mesh(palletGeo, palletWoodMat);
          pallet.position.set(xOffset, y + 0.1, z);
          pallet.castShadow = true;
          racksGroup.add(pallet);

          // Map actual product to this shelf if available
          const prodIndex = (b * 3 + l - 1) % Math.max(1, products.length);
          const prod = products[prodIndex] || {
            name: `Warehouse SKU Unit #${prodIndex + 1}`,
            sku: `SKU-${100 + prodIndex * 10}`,
            quantityOnHand: 24,
            freeToUse: 20,
            minStockRule: 10,
          };

          // Is this the primary receiving slot for newly received items?
          const isRecentlyReceivedSlot = isWest && b === 0 && l === 1 && !!latestDoneReceipt;

          // Box Materials: if recently received, glow emerald!
          let boxColor = 0x3b82f6;
          if (isRecentlyReceivedSlot) {
            boxColor = 0x10b981; // Glowing emerald for newly received shipment!
          } else if (prod.freeToUse <= prod.minReorderThreshold) {
            boxColor = 0xf59e0b; // Amber for low stock
          } else {
            const palette = [0x6366f1, 0x0ea5e9, 0x8b5cf6, 0x06b6d4, 0x3b82f6];
            boxColor = palette[(b * 3 + l) % palette.length];
          }

          const boxMat = new THREE.MeshStandardMaterial({
            color: boxColor,
            roughness: 0.25,
            metalness: isRecentlyReceivedSlot ? 0.3 : 0.1,
            emissive: isRecentlyReceivedSlot ? 0x059669 : 0x000000,
            emissiveIntensity: isRecentlyReceivedSlot ? 0.5 : 0,
          });

          const boxGeo = new THREE.BoxGeometry(1.8, 1.6, 3.8);
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(xOffset, y + 1.0, z);
          box.castShadow = true;
          box.receiveShadow = true;

          // Attach data to mesh for click picking
          box.userData = {
            bayName: `Rack ${isWest ? 'A' : 'B'} - Bay 0${b + 1} L${l}`,
            sku: prod.sku,
            productName: isRecentlyReceivedSlot && latestDoneReceipt ? (latestDoneReceipt.items[0]?.name || prod.name) : prod.name,
            qty: isRecentlyReceivedSlot && latestDoneReceipt ? (latestDoneReceipt.items[0]?.quantityDone || prod.onHand) : prod.onHand,
            capacity: 100,
            status: prod.freeToUse <= prod.minReorderThreshold ? 'Low' : 'Optimal',
            zone: `WH/Stock/${isWest ? 'West' : 'East'}-Aisle`,
            isRecentlyReceived: isRecentlyReceivedSlot,
            recentRef: latestDoneReceipt?.reference,
          };

          boxesGroup.add(box);

          // Add animated beacon over recently received slot
          if (isRecentlyReceivedSlot) {
            const beaconGeo = new THREE.CylinderGeometry(0.1, 0.8, 4, 16, 1, true);
            const beaconMat = new THREE.MeshBasicMaterial({
              color: 0x34d399,
              transparent: true,
              opacity: 0.45,
              side: THREE.DoubleSide,
            });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.set(xOffset, y + 3.0, z);
            boxesGroup.add(beacon);
            beaconMeshRef.current = beacon;
          }
        }
      }
    };

    createRackRow(-6.5, true);
    createRackRow(6.5, false);

    scene.add(racksGroup);
    scene.add(boxesGroup);

    // 7. Autonomous Guided Vehicle (AGV Bot)
    const agvGroup = new THREE.Group();
    const agvBodyGeo = new THREE.BoxGeometry(1.6, 0.5, 2.4);
    const agvBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
    const agvBody = new THREE.Mesh(agvBodyGeo, agvBodyMat);
    agvBody.position.y = 0.35;
    agvBody.castShadow = true;
    agvGroup.add(agvBody);

    // AGV Laser Scanner Beacon
    const laserBeaconGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16);
    const laserBeaconMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const laserBeacon = new THREE.Mesh(laserBeaconGeo, laserBeaconMat);
    laserBeacon.position.set(0, 0.7, 0.8);
    agvGroup.add(laserBeacon);

    // Laser scanning ring
    const laserRingGeo = new THREE.RingGeometry(0.5, 3.5, 32);
    const laserRingMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const laserRing = new THREE.Mesh(laserRingGeo, laserRingMat);
    laserRing.rotation.x = -Math.PI / 2;
    laserRing.position.y = 0.1;
    agvGroup.add(laserRing);

    agvGroup.position.set(0, 0, -8);
    scene.add(agvGroup);
    agvRef.current = agvGroup;

    // 8. Raycaster for Interactive 3D Picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(boxesGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.bayName) {
          setSelectedBay(hit.userData as SelectedBayInfo);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 9. Mouse Orbit Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAngle = 0.8;
    let orbitRadius = 40;
    let cameraHeight = 20;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      orbitAngle -= deltaX * 0.006;
      cameraHeight = Math.max(5, Math.min(36, cameraHeight + deltaY * 0.08));

      camera.position.x = Math.sin(orbitAngle) * orbitRadius;
      camera.position.z = Math.cos(orbitAngle) * orbitRadius;
      camera.position.y = cameraHeight;
      camera.lookAt(0, 3, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRadius = Math.max(14, Math.min(60, orbitRadius + e.deltaY * 0.04));
      camera.position.x = Math.sin(orbitAngle) * orbitRadius;
      camera.position.z = Math.cos(orbitAngle) * orbitRadius;
      camera.position.y = cameraHeight;
      camera.lookAt(0, 3, 0);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop
    let agvProgress = 0;
    let agvDirection = 1;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Auto Orbit
      if (autoRotate && !isDragging) {
        orbitAngle += 0.002;
        camera.position.x = Math.sin(orbitAngle) * orbitRadius;
        camera.position.z = Math.cos(orbitAngle) * orbitRadius;
        camera.position.y = cameraHeight;
        camera.lookAt(0, 3, 0);
      }

      // Pulse beacon over recently received items
      if (beaconMeshRef.current) {
        beaconMeshRef.current.rotation.y += 0.02;
        beaconMeshRef.current.scale.set(
          1 + Math.sin(Date.now() * 0.005) * 0.15,
          1,
          1 + Math.sin(Date.now() * 0.005) * 0.15
        );
      }

      // Autonomous AGV Navigation along aisle
      agvProgress += 0.035 * agvDirection;
      if (agvProgress > 14) agvDirection = -1;
      if (agvProgress < -14) agvDirection = 1;
      if (agvRef.current) {
        agvRef.current.position.z = agvProgress;
        laserRing.rotation.z += 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = fullHeight ? (container.clientHeight || 700) : 520;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [autoRotate, products, latestDoneReceipt, fullHeight]);

  // View preset buttons
  const setView = (view: 'iso' | 'top' | 'aisle' | 'dock') => {
    setCameraView(view);
    if (!cameraRef.current) return;

    if (view === 'iso') {
      cameraRef.current.position.set(24, 20, 28);
      cameraRef.current.lookAt(0, 3, 0);
    } else if (view === 'top') {
      cameraRef.current.position.set(0, 42, 0.1);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (view === 'aisle') {
      cameraRef.current.position.set(0, 3.5, 14);
      cameraRef.current.lookAt(0, 2.5, -6);
    } else if (view === 'dock') {
      cameraRef.current.position.set(0, 8, -26);
      cameraRef.current.lookAt(0, 3, 0);
    }
  };

  // Quick Action to receive test pallets to test real-time 3D update
  const handleSimulateInbound = () => {
    if (products.length === 0) return;
    const prod = products[0];
    const wh = warehouses[0];
    const vendorLoc = locations.find((l) => l.type === 'vendor') || locations[0];
    const destLoc = locations.find((l) => l.type === 'internal') || locations[1] || locations[0];

    if (!wh || !vendorLoc || !destLoc) return;

    const newOp = createOperation({
      operationType: 'RECEIPT',
      warehouseId: wh.id,
      sourceLocationId: vendorLoc.id,
      destinationLocationId: destLoc.id,
      contactName: 'Nexus Global Logistics (Live Demo)',
      scheduledDate: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: prod.id,
          quantity: 25,
        },
      ],
      notes: 'Automated 3D Inbound Pallet Simulation',
    });

    // Mark as Done so it is immediately received into warehouse bins
    transitionOperationStatus(newOp.id, 'Done');

    setInboundToast({
      title: `Shipment Received into 3D Bay (${newOp.reference})`,
      desc: `25 units of ${prod.name} successfully transferred into Rack A1`,
    });
    setShowInboundBanner(true);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-[#0a0f1d] shadow-xl text-white ${
        fullHeight ? 'h-full min-h-[620px]' : ''
      } ${className}`}
    >
      {/* Top Floating HUD bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-slate-900/90 backdrop-blur-md px-3.5 py-2 border border-slate-700/80 shadow-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white">
                3D Digital Twin &middot; Central Facility
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                LIVE 60FPS
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              WebGL Warehouse Matrix &middot; Click any pallet to inspect inventory
            </p>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Preset Camera Views */}
          <div className="flex items-center rounded-xl bg-slate-900/90 backdrop-blur-md p-1 border border-slate-700/80 text-xs font-bold text-slate-300">
            <button
              onClick={() => setView('iso')}
              className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                cameraView === 'iso' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-white'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => setView('top')}
              className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                cameraView === 'top' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-white'
              }`}
            >
              Top-Down
            </button>
            <button
              onClick={() => setView('aisle')}
              className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                cameraView === 'aisle' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-white'
              }`}
            >
              Aisle
            </button>
            <button
              onClick={() => setView('dock')}
              className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${
                cameraView === 'dock' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-white'
              }`}
            >
              Receiving Dock
            </button>
          </div>

          {/* Simulate Inbound Pallet Drop Button */}
          <button
            onClick={handleSimulateInbound}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/70 hover:bg-emerald-900 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-md transition-all cursor-pointer active:scale-95"
            title="Simulate incoming receipt to trigger live 3D bay update"
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">Receive Pallet</span>
          </button>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer backdrop-blur-md shadow-xs ${
              autoRotate
                ? 'border-indigo-500/50 bg-indigo-950/60 text-indigo-300'
                : 'border-slate-700 bg-slate-900/90 text-slate-400'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Orbit</span>
          </button>
        </div>
      </div>

      {/* Live Inbound Toast Notification */}
      <AnimatePresence>
        {showInboundBanner && inboundToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 sm:left-auto sm:right-4 z-20 max-w-md rounded-2xl border border-emerald-500/40 bg-emerald-950/90 backdrop-blur-xl p-3.5 shadow-2xl text-emerald-100 flex items-start gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 flex-shrink-0">
              <Zap className="h-4 w-4 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{inboundToast.title}</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Just Now</span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">{inboundToast.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full cursor-grab active:cursor-grabbing ${
          fullHeight ? 'h-[620px] sm:h-[700px]' : 'h-[460px] sm:h-[520px]'
        }`}
      />

      {/* Bottom Floating Telemetry Panel for Clicked Pallet */}
      {selectedBay && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 sm:max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                  {selectedBay.zone}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{selectedBay.bayName}</span>
                {selectedBay.isRecentlyReceived && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.2 text-[9px] font-mono font-bold text-emerald-300 animate-pulse">
                    RECENT INBOUND
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{selectedBay.productName}</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedBay.sku}</p>
            </div>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                selectedBay.status === 'Optimal'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {selectedBay.status}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
            <div>
              <span className="text-[10px] text-slate-400">Occupancy Level</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-white">{selectedBay.qty}</span>
                <span className="text-[10px] text-slate-500">/ {selectedBay.capacity} units</span>
              </div>
              {/* Progress bar */}
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                  style={{ width: `${Math.min(100, (selectedBay.qty / selectedBay.capacity) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400">Automated AGV Picking</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>AGV-01 Route Active</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Turnaround 3.2m</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Instructions Pill */}
      <div className="absolute bottom-4 right-4 hidden lg:flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5 text-[10px] font-semibold text-slate-400 backdrop-blur-md border border-slate-800 pointer-events-none">
        <Sparkles className="h-3 w-3 text-indigo-400" />
        <span>Drag to rotate &middot; Scroll to zoom &middot; Click any box to inspect</span>
      </div>
    </div>
  );
}
export default ThreeWarehouseViewer;
