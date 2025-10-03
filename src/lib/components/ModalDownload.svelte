<script lang="ts">
  import { getContext, onMount } from 'svelte'
  import { pb } from '$lib/pocketbase';
    import type { RecordModel } from 'pocketbase'

  let loading = true;
  let data: RecordModel[] = [];

  const downloadCSV = (dataArray: any[], filename: string) => {
    if (!dataArray.length) return;
    const keys = Object.keys(dataArray[0]);
    const csvRows = [
      keys.join(","), // header
      ...dataArray.map((row) =>
        keys.map((key) => JSON.stringify(row[key] ?? "")).join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFullDataDownload = async () => {
    // ----------------------
    // CSV complet
    // ----------------------
    const fullData = data.map((slot) => ({
      id: slot.id,
      "debut": slot.start,
      "fin": slot.end,
      "etudiant prenom": slot.expand!.student.firstName,
      "etudiant nom": slot.expand!.student.lastName,
      "etudiant UHCD": slot.expand!.student.UHCD,
      "etudiant annee": slot.expand!.student.year,
      "etudiant id": slot.student,
      "hopital": slot.hospital,
      "secteur": slot.sector,
    }));

    // Télécharger le CSV complet
    downloadCSV(fullData, "on-call-slots-full.csv");
  };

  const handleGroupedDataDownload = async () => {
    // ----------------------
    // CSV groupé par studentId
    // ----------------------
    const groupedData = Object.values(
      data.reduce((acc, row) => {
        const studentId = row.student;
        if (!acc[studentId]) {
          acc[studentId] = {
            "etudiant id": studentId,
            "etudiant prenom": row.expand!.student.firstName,
            "etudiant nom": row.expand!.student.lastName,
            "etudiant annee": row.expand!.student.year,
            "etudiant UHCD": row.expand!.student.UHCD,
            "nombre de creneaux": 1,
          };
        } else {
          acc[studentId]["nombre de creneaux"] += 1;
        }
        return acc;
      }, {} as Record<string, any>)
    );

    // Télécharger le CSV groupé
    downloadCSV(groupedData, "on-call-slots-grouped.csv");
  };

  onMount(async () => {
    try {
      data = await pb.send("/api/download-all-on-call-slots", {});
    } catch (error) {
      console.error(error);
    } finally {
      loading = false;
    }
  })

  const {
    handleModalClose,
  } = getContext('isDownloadModalOpen') as {
    handleModalClose: () => void,
  };

  export let isDownloadModalOpen: boolean = false;
</script>

<div class="modal" class:modal-open={isDownloadModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">
      Télécharger
    </h3>
    <div class="py-2">
      Vous pouvez télécharger les données des créneaux d'appel en deux formats :
      <ul class="list-disc list-inside space-y-2 p-4">
        <li class="text-base-content">
          CSV complet : toutes les informations de chaque créneau
        </li>
        <li class="text-base-content">
          CSV groupé : résumé par étudiant avec prénom, nom et nombre de créneaux
        </li>
      </ul>
    </div>
    <div class="modal-action">
      <button 
        class="btn"
        on:click={handleModalClose}
      >
        Annuler
      </button>
      <button 
        class="btn btn-primary"
        on:click={handleFullDataDownload}
      >
        CSV complet
      </button>
      <button 
        class="btn btn-primary"
        on:click={handleGroupedDataDownload}
      >
        CSV groupé
      </button>
    </div>
  </div>
  <div class="modal-backdrop">
    <button on:click={handleModalClose}>Fermer</button>
  </div>
</div>